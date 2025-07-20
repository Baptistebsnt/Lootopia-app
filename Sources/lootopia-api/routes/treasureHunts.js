import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { db } from '../database/init.js';

const treasureHunts = new Hono();

// Get all treasure hunts (with pagination)
treasureHunts.get('/', optionalAuthMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    const hunts = db.prepare(`
      SELECT 
        th.*,
        COUNT(thu.id) as participants_count
      FROM treasure_hunts th
      LEFT JOIN treasure_hunts_users thu ON th.id = thu.treasure_hunt_id
      WHERE th.deleted_at IS NULL
      GROUP BY th.id
      ORDER BY th.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM treasure_hunts WHERE deleted_at IS NULL
    `).get().count;

    return c.json({
      treasureHunts: hunts.map(hunt => ({
        id: hunt.id,
        name: hunt.name,
        description: hunt.description,
        planner: hunt.planner,
        planner_name: hunt.planner_name,
        participants_count: hunt.participants_count,
        entry_cost: hunt.entry_cost,
        crown_reward: hunt.crown_reward,
        created_at: hunt.created_at
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get treasure hunts error:', error);
    return c.json({ error: 'Failed to get treasure hunts' }, 500);
  }
});

// Get specific treasure hunt
treasureHunts.get('/:id', optionalAuthMiddleware, async (c) => {
  try {
    const huntId = c.req.param('id');

    const hunt = db.prepare(`
      SELECT 
        th.*,
        COUNT(thu.id) as participants_count
      FROM treasure_hunts th
      LEFT JOIN treasure_hunts_users thu ON th.id = thu.treasure_hunt_id
      WHERE th.id = ? AND th.deleted_at IS NULL
      GROUP BY th.id
    `).get(huntId);

    if (!hunt) {
      return c.json({ error: 'Treasure hunt not found' }, 404);
    }

    return c.json({
      treasureHunt: {
        id: hunt.id,
        name: hunt.name,
        description: hunt.description,
        planner: hunt.planner,
        planner_name: hunt.planner_name,
        participants_count: hunt.participants_count,
        entry_cost: hunt.entry_cost,
        crown_reward: hunt.crown_reward,
        created_at: hunt.created_at
      }
    });

  } catch (error) {
    console.error('Get treasure hunt error:', error);
    return c.json({ error: 'Failed to get treasure hunt' }, 500);
  }
});

// Create treasure hunt
treasureHunts.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    const createSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      entry_cost: z.number().min(0).optional(),
      crown_reward: z.number().min(0).optional(),
      image_url: z.string().url().optional(),
      steps: z.array(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        validation_type: z.string(),
        validation_value: z.string(),
        order: z.number()
      })).optional()
    });

    const validatedData = createSchema.parse(body);

    // Create treasure hunt
    const huntId = uuidv4();
    const insertHunt = db.prepare(`
      INSERT INTO treasure_hunts (id, name, description, planner, planner_name, entry_cost, crown_reward, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertHunt.run(
      huntId,
      validatedData.name,
      validatedData.description || null,
      user.id,
      user.pseudo || user.email,
      validatedData.entry_cost || 0,
      validatedData.crown_reward || 100,
      validatedData.image_url || null
    );

    // Create steps if provided
    if (validatedData.steps && validatedData.steps.length > 0) {
      const insertStep = db.prepare(`
        INSERT INTO steps (id, treasure_hunt_id, title, description, validation_type, validation_value, step_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      validatedData.steps.forEach(step => {
        const stepId = uuidv4();
        insertStep.run(
          stepId,
          huntId,
          step.title,
          step.description || null,
          step.validation_type,
          step.validation_value,
          step.order
        );
      });
    }

    return c.json({
      message: 'Treasure hunt created successfully',
      treasureHunt: {
        id: huntId,
        name: validatedData.name,
        description: validatedData.description,
        planner: user.id,
        planner_name: user.pseudo || user.email,
        entry_cost: validatedData.entry_cost || 0,
        crown_reward: validatedData.crown_reward || 100
      }
    }, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Create treasure hunt error:', error);
    return c.json({ error: 'Failed to create treasure hunt' }, 500);
  }
});

// Join treasure hunt
treasureHunts.post('/:id/join', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const huntId = c.req.param('id');

    // Check if treasure hunt exists
    const hunt = db.prepare(`
      SELECT * FROM treasure_hunts WHERE id = ? AND deleted_at IS NULL
    `).get(huntId);

    if (!hunt) {
      return c.json({ error: 'Treasure hunt not found' }, 404);
    }

    // Check if user already joined
    const existingParticipation = db.prepare(`
      SELECT id FROM treasure_hunts_users WHERE user_id = ? AND treasure_hunt_id = ?
    `).get(user.id, huntId);

    if (existingParticipation) {
      return c.json({ error: 'You have already joined this treasure hunt' }, 400);
    }

    // Check if user has enough crowns for entry fee
    if (hunt.entry_cost > 0 && user.crown_balance < hunt.entry_cost) {
      return c.json({ 
        error: 'Insufficient crowns for entry fee',
        required: hunt.entry_cost,
        available: user.crown_balance
      }, 400);
    }

    const joinedAt = new Date().toISOString();

    // Start transaction for joining hunt
    const transaction = db.transaction(() => {
      // Add user to treasure hunt
      const participationId = uuidv4();
      db.prepare(`
        INSERT INTO treasure_hunts_users (id, user_id, treasure_hunt_id, entry_fee_paid)
        VALUES (?, ?, ?, ?)
      `).run(participationId, user.id, huntId, hunt.entry_cost);

      // Update participants count
      db.prepare(`
        UPDATE treasure_hunts 
        SET participants_count = participants_count + 1 
        WHERE id = ?
      `).run(huntId);

      // Deduct entry fee if applicable
      if (hunt.entry_cost > 0) {
        const balanceBefore = user.crown_balance;
        const balanceAfter = balanceBefore - hunt.entry_cost;

        // Update user's crown balance
        db.prepare(`
          UPDATE users SET crown_balance = ? WHERE id = ?
        `).run(balanceAfter, user.id);

        // Record crown transaction
        db.prepare(`
          INSERT INTO crown_transactions (
            id, user_id, transaction_type, amount, description, 
            reference_type, reference_id, balance_before, balance_after
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          uuidv4(),
          user.id,
          'spend',
          hunt.entry_cost,
          `Entry fee for "${hunt.name}"`,
          'hunt_entry',
          huntId,
          balanceBefore,
          balanceAfter
        );
      }
    });

    transaction();

    return c.json({
      message: 'Successfully joined treasure hunt',
      participation: {
        id: participationId,
        user_id: user.id,
        treasure_hunt_id: huntId,
        joined_at: joinedAt,
        entry_fee_paid: hunt.entry_cost
      },
      new_crown_balance: user.crown_balance - hunt.entry_cost
    }, 201);

  } catch (error) {
    console.error('Join treasure hunt error:', error);
    return c.json({ error: 'Failed to join treasure hunt' }, 500);
  }
});

// Get hunt progress for a user
treasureHunts.get('/:id/progress', authMiddleware, async (c) => {
  try {
    const huntId = c.req.param('id');
    const userId = c.get('userId');

    // Check if user has joined this hunt
    const participation = db.prepare(`
      SELECT * FROM treasure_hunts_users 
      WHERE user_id = ? AND treasure_hunt_id = ?
    `).get(userId, huntId);

    if (!participation) {
      return c.json({ error: 'You must join this treasure hunt first' }, 400);
    }

    // Get total steps
    const totalSteps = db.prepare(`
      SELECT COUNT(*) as count FROM steps WHERE treasure_hunt_id = ?
    `).get(huntId).count;

    // Get completed steps
    const completedSteps = db.prepare(`
      SELECT COUNT(*) as count FROM step_completions 
      WHERE user_id = ? AND treasure_hunt_id = ?
    `).get(userId, huntId).count;

    // Get next step (if any)
    let nextStep = null;
    if (!participation.is_completed && completedSteps < totalSteps) {
      const completedStepIds = db.prepare(`
        SELECT step_id FROM step_completions 
        WHERE user_id = ? AND treasure_hunt_id = ?
      `).all(userId, huntId).map(row => row.step_id);

      if (completedStepIds.length === 0) {
        // Get first step
        nextStep = db.prepare(`
          SELECT * FROM steps 
          WHERE treasure_hunt_id = ? 
          ORDER BY step_order ASC 
          LIMIT 1
        `).get(huntId);
      } else {
        // Get next uncompleted step
        const placeholders = completedStepIds.map(() => '?').join(',');
        nextStep = db.prepare(`
          SELECT * FROM steps 
          WHERE treasure_hunt_id = ? AND id NOT IN (${placeholders})
          ORDER BY step_order ASC 
          LIMIT 1
        `).get(huntId, ...completedStepIds);
      }
    }

    const progress = {
      treasure_hunt_id: huntId,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      completion_percentage: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
      is_completed: participation.is_completed || false,
      completed_at: participation.completed_at || null,
      completion_position: participation.completion_position || null,
      crown_reward_earned: participation.crown_reward_earned || 0,
      next_step: nextStep
    };

    return c.json({ progress });

  } catch (error) {
    console.error('Error fetching hunt progress:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user's completed hunts
treasureHunts.get('/user/completed', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');

    const completedHunts = db.prepare(`
      SELECT 
        th.*,
        thu.completed_at,
        thu.completion_position,
        thu.joined_at,
        thu.crown_reward_earned
      FROM treasure_hunts th
      JOIN treasure_hunts_users thu ON th.id = thu.treasure_hunt_id
      WHERE thu.user_id = ? AND thu.is_completed = TRUE
      ORDER BY thu.completed_at DESC
    `).all(userId);

    return c.json({
      completedHunts: completedHunts.map(hunt => ({
        id: hunt.id,
        name: hunt.name,
        description: hunt.description,
        planner_name: hunt.planner_name,
        created_at: hunt.created_at,
        completed_at: hunt.completed_at,
        completion_position: hunt.completion_position,
        joined_at: hunt.joined_at,
        crown_reward_earned: hunt.crown_reward_earned
      }))
    });

  } catch (error) {
    console.error('Error fetching completed hunts:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { treasureHunts as treasureHuntRoutes };