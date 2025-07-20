import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../database/init.js';

const digAttempts = new Hono();

// Get user's dig attempts
digAttempts.get('/user', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const attempts = db.prepare(`
      SELECT 
        da.*,
        th.name as treasure_hunt_name,
        u.pseudo as user_name
      FROM dig_attempts da
      JOIN treasure_hunts th ON da.treasure_hunt_id = th.id
      JOIN users u ON da.user_id = u.id
      WHERE da.user_id = ?
      ORDER BY da.attempted_at DESC
    `).all(user.id);

    return c.json({
      digAttempts: attempts.map(attempt => ({
        id: attempt.id,
        user_id: attempt.user_id,
        user_name: attempt.user_name,
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

// Get dig attempts for a treasure hunt
digAttempts.get('/treasure-hunt/:huntId', authMiddleware, async (c) => {
  try {
    const huntId = c.req.param('huntId');

    const attempts = db.prepare(`
      SELECT 
        da.*,
        u.pseudo as user_name
      FROM dig_attempts da
      JOIN users u ON da.user_id = u.id
      WHERE da.treasure_hunt_id = ?
      ORDER BY da.attempted_at DESC
    `).all(huntId);

    return c.json({
      digAttempts: attempts.map(attempt => ({
        id: attempt.id,
        user_id: attempt.user_id,
        user_name: attempt.user_name,
        treasure_hunt_id: attempt.treasure_hunt_id,
        latitude: attempt.latitude,
        longitude: attempt.longitude,
        success: attempt.success,
        attempted_at: attempt.attempted_at
      }))
    });

  } catch (error) {
    console.error('Get hunt dig attempts error:', error);
    return c.json({ error: 'Failed to get dig attempts' }, 500);
  }
});

// Create dig attempt
digAttempts.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    const createSchema = z.object({
      treasure_hunt_id: z.string().uuid(),
      latitude: z.number(),
      longitude: z.number()
    });

    const validatedData = createSchema.parse(body);

    // Check if user has joined the treasure hunt
    const participation = db.prepare(`
      SELECT id FROM treasure_hunts_users 
      WHERE user_id = ? AND treasure_hunt_id = ?
    `).get(user.id, validatedData.treasure_hunt_id);

    if (!participation) {
      return c.json({ error: 'You must join this treasure hunt first' }, 400);
    }

    // For now, we'll randomly determine success (you can implement your own logic)
    const success = Math.random() < 0.3; // 30% chance of success

    // Create dig attempt
    const attemptId = uuidv4();
    db.prepare(`
      INSERT INTO dig_attempts (id, user_id, treasure_hunt_id, latitude, longitude, success)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      attemptId,
      user.id,
      validatedData.treasure_hunt_id,
      validatedData.latitude,
      validatedData.longitude,
      success
    );

    return c.json({
      message: success ? 'Dig successful! You found something!' : 'Dig unsuccessful. Nothing found.',
      digAttempt: {
        id: attemptId,
        user_id: user.id,
        treasure_hunt_id: validatedData.treasure_hunt_id,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        success,
        attempted_at: new Date().toISOString()
      }
    }, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Create dig attempt error:', error);
    return c.json({ error: 'Failed to create dig attempt' }, 500);
  }
});

export { digAttempts as digAttemptRoutes };