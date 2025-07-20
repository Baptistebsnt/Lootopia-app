import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { db } from '../database/init.js';

const rewards = new Hono();

// Get all rewards
rewards.get('/', optionalAuthMiddleware, async (c) => {
  try {
    const rewardsList = db.prepare(`
      SELECT 
        r.*,
        th.name as treasure_hunt_name,
        a.name as artefact_name
      FROM rewards r
      JOIN treasure_hunts th ON r.treasure_hunt_id = th.id
      LEFT JOIN artefacts a ON r.artefact_id = a.id
      ORDER BY r.created_at DESC
    `).all();

    return c.json({
      rewards: rewardsList.map(reward => ({
        id: reward.id,
        treasure_hunt_id: reward.treasure_hunt_id,
        treasure_hunt_name: reward.treasure_hunt_name,
        type: reward.type,
        name: reward.name,
        description: reward.description,
        value: reward.value,
        rarity: reward.rarity,
        artefact_id: reward.artefact_id,
        artefact_name: reward.artefact_name,
        created_at: reward.created_at
      }))
    });

  } catch (error) {
    console.error('Get rewards error:', error);
    return c.json({ error: 'Failed to get rewards' }, 500);
  }
});

// Get specific reward
rewards.get('/:id', optionalAuthMiddleware, async (c) => {
  try {
    const rewardId = c.req.param('id');

    const reward = db.prepare(`
      SELECT 
        r.*,
        th.name as treasure_hunt_name,
        a.name as artefact_name
      FROM rewards r
      JOIN treasure_hunts th ON r.treasure_hunt_id = th.id
      LEFT JOIN artefacts a ON r.artefact_id = a.id
      WHERE r.id = ?
    `).get(rewardId);

    if (!reward) {
      return c.json({ error: 'Reward not found' }, 404);
    }

    return c.json({
      reward: {
        id: reward.id,
        treasure_hunt_id: reward.treasure_hunt_id,
        treasure_hunt_name: reward.treasure_hunt_name,
        type: reward.type,
        name: reward.name,
        description: reward.description,
        value: reward.value,
        rarity: reward.rarity,
        artefact_id: reward.artefact_id,
        artefact_name: reward.artefact_name,
        created_at: reward.created_at
      }
    });

  } catch (error) {
    console.error('Get reward error:', error);
    return c.json({ error: 'Failed to get reward' }, 500);
  }
});

// Create reward (only hunt planners)
rewards.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    const createSchema = z.object({
      treasure_hunt_id: z.string().uuid(),
      type: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      value: z.number().optional(),
      rarity: z.string().optional(),
      artefact_id: z.string().uuid().optional()
    });

    const validatedData = createSchema.parse(body);

    // Check if user is the planner of the treasure hunt
    const hunt = db.prepare(`
      SELECT planner FROM treasure_hunts WHERE id = ? AND deleted_at IS NULL
    `).get(validatedData.treasure_hunt_id);

    if (!hunt) {
      return c.json({ error: 'Treasure hunt not found' }, 404);
    }

    if (hunt.planner !== user.id) {
      return c.json({ error: 'Only the hunt planner can add rewards' }, 403);
    }

    // Create reward
    const rewardId = uuidv4();
    db.prepare(`
      INSERT INTO rewards (id, treasure_hunt_id, type, name, description, value, rarity, artefact_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      rewardId,
      validatedData.treasure_hunt_id,
      validatedData.type,
      validatedData.name || null,
      validatedData.description || null,
      validatedData.value || null,
      validatedData.rarity || null,
      validatedData.artefact_id || null
    );

    return c.json({
      message: 'Reward created successfully',
      reward: {
        id: rewardId,
        ...validatedData
      }
    }, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Create reward error:', error);
    return c.json({ error: 'Failed to create reward' }, 500);
  }
});

export { rewards as rewardRoutes };