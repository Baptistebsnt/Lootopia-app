import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../database/init.js';

const users = new Hono();

// Get user profile
users.get('/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { password_hash, ...userWithoutPassword } = user;
    
    return c.json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return c.json({ error: 'Failed to get user profile' }, 500);
  }
});

// Update user profile
users.put('/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    
    const updateSchema = z.object({
      pseudo: z.string().min(1).optional(),
      lastName: z.string().optional(),
      surName: z.string().optional()
    });

    const validatedData = updateSchema.parse(body);

    // Update user
    const updateFields = [];
    const updateValues = [];

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(user.id);
      db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
    }

    // Get updated user
    const updatedUser = db.prepare(`
      SELECT id, email, pseudo, lastName, surName, role, crown_balance, created_at
      FROM users WHERE id = ?
    `).get(user.id);

    return c.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Get user's treasure hunts
users.get('/treasure-hunts', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const treasureHunts = db.prepare(`
      SELECT 
        th.*,
        thu.joined_at,
        thu.completed_at,
        thu.completion_position,
        thu.is_completed,
        thu.entry_fee_paid,
        thu.crown_reward_earned
      FROM treasure_hunts th
      JOIN treasure_hunts_users thu ON th.id = thu.treasure_hunt_id
      WHERE thu.user_id = ? AND th.deleted_at IS NULL
      ORDER BY thu.joined_at DESC
    `).all(user.id);

    return c.json({
      treasureHunts: treasureHunts.map(hunt => ({
        id: hunt.id,
        name: hunt.name,
        description: hunt.description,
        planner_name: hunt.planner_name,
        participants_count: hunt.participants_count,
        entry_cost: hunt.entry_cost,
        crown_reward: hunt.crown_reward,
        created_at: hunt.created_at,
        joined_at: hunt.joined_at,
        completed_at: hunt.completed_at,
        completion_position: hunt.completion_position,
        is_completed: hunt.is_completed,
        entry_fee_paid: hunt.entry_fee_paid,
        crown_reward_earned: hunt.crown_reward_earned
      }))
    });

  } catch (error) {
    console.error('Get user treasure hunts error:', error);
    return c.json({ error: 'Failed to get treasure hunts' }, 500);
  }
});

// Get user's artefacts
users.get('/artefacts', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const artefacts = db.prepare(`
      SELECT 
        a.*,
        ua.obtained_at,
        ua.obtained_from,
        ua.is_listed,
        ua.id as user_artefact_id
      FROM artefacts a
      JOIN user_artefacts ua ON a.id = ua.artefact_id
      WHERE ua.user_id = ?
      ORDER BY ua.obtained_at DESC
    `).all(user.id);

    return c.json({
      artefacts: artefacts.map(artefact => ({
        id: artefact.id,
        user_artefact_id: artefact.user_artefact_id,
        name: artefact.name,
        description: artefact.description,
        rarity: artefact.rarity,
        image_url: artefact.image_url,
        effect: artefact.effect,
        base_value: artefact.base_value,
        is_tradeable: artefact.is_tradeable,
        obtained_at: artefact.obtained_at,
        obtained_from: artefact.obtained_from,
        is_listed: artefact.is_listed
      }))
    });

  } catch (error) {
    console.error('Get user artefacts error:', error);
    return c.json({ error: 'Failed to get artefacts' }, 500);
  }
});

// Get user's dig attempts
users.get('/dig-attempts', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const digAttempts = db.prepare(`
      SELECT 
        da.*,
        th.name as treasure_hunt_name
      FROM dig_attempts da
      JOIN treasure_hunts th ON da.treasure_hunt_id = th.id
      WHERE da.user_id = ?
      ORDER BY da.attempted_at DESC
    `).all(user.id);

    return c.json({
      digAttempts: digAttempts.map(attempt => ({
        id: attempt.id,
        user_id: attempt.user_id,
        treasure_hunt_id: attempt.treasure_hunt_id,
        treasure_hunt_name: attempt.treasure_hunt_name,
        latitude: attempt.latitude,
        longitude: attempt.longitude,
        success: attempt.success,
        attempted_at: attempt.attempted_at
      }))
    });

  } catch (error) {
    console.error('Get user dig attempts error:', error);
    return c.json({ error: 'Failed to get dig attempts' }, 500);
  }
});

// Get user's crown balance and transaction history
users.get('/crown-balance', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const balance = db.prepare(`
      SELECT crown_balance FROM users WHERE id = ?
    `).get(user.id);

    const recentTransactions = db.prepare(`
      SELECT * FROM crown_transactions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(user.id);

    return c.json({
      crown_balance: balance.crown_balance,
      recent_transactions: recentTransactions.map(tx => ({
        id: tx.id,
        transaction_type: tx.transaction_type,
        amount: tx.amount,
        description: tx.description,
        reference_type: tx.reference_type,
        balance_after: tx.balance_after,
        created_at: tx.created_at
      }))
    });

  } catch (error) {
    console.error('Get crown balance error:', error);
    return c.json({ error: 'Failed to get crown balance' }, 500);
  }
});

export { users as userRoutes };