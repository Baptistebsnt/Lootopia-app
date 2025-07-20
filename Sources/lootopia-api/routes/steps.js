import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { db } from '../database/init.js';

const steps = new Hono();

// Get steps for a treasure hunt with user progress (requires auth)
steps.get('/treasure-hunt/:huntId', authMiddleware, async (c) => {
  try {
    const huntId = c.req.param('huntId');
    const user = c.get('user');

    console.log(`Getting steps for hunt ${huntId} for user ${user.id}`);

    const stepsList = db.prepare(`
      SELECT 
        s.*,
        sc.completed_at,
        sc.validation_data,
        CASE WHEN sc.id IS NOT NULL THEN 1 ELSE 0 END as completed
      FROM steps s
      LEFT JOIN step_completions sc ON s.id = sc.step_id AND sc.user_id = ?
      WHERE s.treasure_hunt_id = ? 
      ORDER BY s.step_order
    `).all(user.id, huntId);

    console.log(`Found ${stepsList.length} steps for hunt ${huntId}`);

    return c.json({ 
      steps: stepsList.map(step => ({
        id: step.id,
        treasure_hunt_id: step.treasure_hunt_id,
        title: step.title,
        description: step.description,
        validation_type: step.validation_type,
        validation_value: step.validation_value,
        step_order: step.step_order,
        created_at: step.created_at,
        completed: step.completed,
        completed_at: step.completed_at,
        validation_data: step.validation_data
      }))
    });

  } catch (error) {
    console.error('Get steps error:', error);
    return c.json({ error: 'Failed to get steps', details: error.message }, 500);
  }
});

// Get steps for a treasure hunt (public - no user progress)
steps.get('/treasure-hunt/:huntId/public', optionalAuthMiddleware, async (c) => {
  try {
    const huntId = c.req.param('huntId');

    console.log(`Getting public steps for hunt ${huntId}`);

    const stepsList = db.prepare(`
      SELECT * FROM steps WHERE treasure_hunt_id = ? ORDER BY step_order
    `).all(huntId);

    console.log(`Found ${stepsList.length} public steps for hunt ${huntId}`);

    return c.json({ 
      steps: stepsList.map(step => ({
        id: step.id,
        treasure_hunt_id: step.treasure_hunt_id,
        title: step.title,
        description: step.description,
        validation_type: step.validation_type,
        validation_value: step.validation_value,
        step_order: step.step_order,
        created_at: step.created_at
      }))
    });

  } catch (error) {
    console.error('Get public steps error:', error);
    return c.json({ error: 'Failed to get steps', details: error.message }, 500);
  }
});

// Complete a step
steps.post('/complete', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { step_id, treasure_hunt_id, validation_data } = body;
    const userId = c.get('userId');

    console.log(`User ${userId} attempting to complete step ${step_id} in hunt ${treasure_hunt_id}`);

    // Check if user has joined this treasure hunt
    const participation = db.prepare(`
      SELECT * FROM treasure_hunts_users 
      WHERE user_id = ? AND treasure_hunt_id = ?
    `).get(userId, treasure_hunt_id);

    if (!participation) {
      return c.json({ error: 'You must join this treasure hunt first' }, 400);
    }

    // Check if step exists and belongs to this hunt
    const step = db.prepare(`
      SELECT * FROM steps 
      WHERE id = ? AND treasure_hunt_id = ?
    `).get(step_id, treasure_hunt_id);

    if (!step) {
      return c.json({ error: 'Step not found' }, 404);
    }

    // Check if step is already completed by this user
    const existingCompletion = db.prepare(`
      SELECT * FROM step_completions 
      WHERE user_id = ? AND step_id = ?
    `).get(userId, step_id);

    if (existingCompletion) {
      return c.json({ error: 'Step already completed' }, 400);
    }

    // Validate step requirements
    let isValid = false;
    let validationMessage = '';

    switch (step.validation_type) {
      case 'location':
        if (!validation_data.location) {
          return c.json({ error: 'Location data required for this step' }, 400);
        }
        
        const [targetLat, targetLng] = step.validation_value.split(',').map(coord => parseFloat(coord.trim()));
        const distance = calculateDistance(
          validation_data.location.lat, 
          validation_data.location.lng, 
          targetLat, 
          targetLng
        );
        
        isValid = distance <= 50; // Within 50 meters
        validationMessage = isValid ? 'Location validated' : `Too far from target (${Math.round(distance)}m away)`;
        break;

      case 'text':
        if (!validation_data.answer) {
          return c.json({ error: 'Answer required for this step' }, 400);
        }
        
        isValid = validation_data.answer.toLowerCase().trim() === step.validation_value.toLowerCase().trim();
        validationMessage = isValid ? 'Correct answer' : 'Incorrect answer';
        break;

      case 'qr_code':
        if (!validation_data.qrCode) {
          return c.json({ error: 'QR code required for this step' }, 400);
        }
        
        isValid = validation_data.qrCode === step.validation_value;
        validationMessage = isValid ? 'QR code validated' : 'Invalid QR code';
        break;

      default:
        return c.json({ error: 'Unknown validation type' }, 400);
    }

    if (!isValid) {
      return c.json({ 
        error: 'Validation failed', 
        message: validationMessage 
      }, 400);
    }

    // Check if previous steps are completed (sequential completion)
    const previousSteps = db.prepare(`
      SELECT s.id FROM steps s
      WHERE s.treasure_hunt_id = ? AND s.step_order < ?
      ORDER BY s.step_order
    `).all(treasure_hunt_id, step.step_order);

    for (const prevStep of previousSteps) {
      const prevCompletion = db.prepare(`
        SELECT * FROM step_completions 
        WHERE user_id = ? AND step_id = ?
      `).get(userId, prevStep.id);

      if (!prevCompletion) {
        return c.json({ 
          error: 'Previous steps must be completed first',
          requiredStep: prevStep.id 
        }, 400);
      }
    }

    // Record step completion
    const completionId = uuidv4();
    const completedAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO step_completions (
        id, user_id, step_id, treasure_hunt_id, 
        validation_data, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      completionId,
      userId,
      step_id,
      treasure_hunt_id,
      JSON.stringify(validation_data),
      completedAt
    );

    // Check if all steps are completed (hunt completion)
    const totalSteps = db.prepare(`
      SELECT COUNT(*) as count FROM steps WHERE treasure_hunt_id = ?
    `).get(treasure_hunt_id).count;

    const completedSteps = db.prepare(`
      SELECT COUNT(*) as count FROM step_completions 
      WHERE user_id = ? AND treasure_hunt_id = ?
    `).get(userId, treasure_hunt_id).count;

    let huntCompleted = false;
    let completionPosition = null;
    let crownReward = 0;

    if (completedSteps === totalSteps) {
      // Hunt is completed! Record the completion
      const existingWinner = db.prepare(`
        SELECT * FROM winners 
        WHERE user_id = ? AND treasure_hunt_id = ?
      `).get(userId, treasure_hunt_id);

      if (!existingWinner) {
        // Get hunt details for crown reward
        const hunt = db.prepare(`
          SELECT crown_reward FROM treasure_hunts WHERE id = ?
        `).get(treasure_hunt_id);

        crownReward = hunt.crown_reward || 100;

        // Get completion position
        const winnerCount = db.prepare(`
          SELECT COUNT(*) as count FROM winners WHERE treasure_hunt_id = ?
        `).get(treasure_hunt_id).count;

        completionPosition = winnerCount + 1;

        // Calculate position-based bonus (1st place gets 50% bonus, 2nd gets 25%, 3rd gets 10%)
        let positionBonus = 0;
        if (completionPosition === 1) {
          positionBonus = Math.floor(crownReward * 0.5);
        } else if (completionPosition === 2) {
          positionBonus = Math.floor(crownReward * 0.25);
        } else if (completionPosition === 3) {
          positionBonus = Math.floor(crownReward * 0.1);
        }

        const totalReward = crownReward + positionBonus;

        // Start transaction for hunt completion
        const transaction = db.transaction(() => {
          // Record as winner
          const winnerId = uuidv4();
          db.prepare(`
            INSERT INTO winners (
              id, user_id, treasure_hunt_id, 
              completed_at, position, crown_reward
            ) VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            winnerId,
            userId,
            treasure_hunt_id,
            completedAt,
            completionPosition,
            totalReward
          );

          // Update treasure_hunts_users table with completion info
          db.prepare(`
            UPDATE treasure_hunts_users 
            SET completed_at = ?, completion_position = ?, is_completed = TRUE, crown_reward_earned = ?
            WHERE user_id = ? AND treasure_hunt_id = ?
          `).run(
            completedAt,
            completionPosition,
            totalReward,
            userId,
            treasure_hunt_id
          );

          // Award crowns to user
          const user = db.prepare('SELECT crown_balance FROM users WHERE id = ?').get(userId);
          const balanceBefore = user.crown_balance;
          const balanceAfter = balanceBefore + totalReward;

          db.prepare(`
            UPDATE users SET crown_balance = ? WHERE id = ?
          `).run(balanceAfter, userId);

          // Record crown transaction
          db.prepare(`
            INSERT INTO crown_transactions (
              id, user_id, transaction_type, amount, description, 
              reference_type, reference_id, balance_before, balance_after
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            uuidv4(),
            userId,
            'earn',
            totalReward,
            `Hunt completion reward (Position #${completionPosition})${positionBonus > 0 ? ` + ${positionBonus} position bonus` : ''}`,
            'hunt_completion',
            treasure_hunt_id,
            balanceBefore,
            balanceAfter
          );

          // Award rewards (if any)
          const rewards = db.prepare(`
            SELECT * FROM rewards WHERE treasure_hunt_id = ?
          `).all(treasure_hunt_id);

          for (const reward of rewards) {
            if (reward.type === 'artefact' && reward.artefact_id) {
              // Award artefact to user
              const userArtefactId = uuidv4();
              db.prepare(`
                INSERT INTO user_artefacts (
                  id, user_id, artefact_id, obtained_at, obtained_from
                ) VALUES (?, ?, ?, ?, ?)
              `).run(
                userArtefactId,
                userId,
                reward.artefact_id,
                completedAt,
                treasure_hunt_id
              );
            }
          }
        });

        transaction();
        huntCompleted = true;
        crownReward = totalReward;
      }
    }

    // Get updated progress
    const progress = {
      treasure_hunt_id,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      completion_percentage: (completedSteps / totalSteps) * 100,
      is_completed: huntCompleted,
      completed_at: huntCompleted ? completedAt : null,
      completion_position: completionPosition
    };

    console.log(`Step ${step_id} completed successfully. Hunt completed: ${huntCompleted}`);

    return c.json({
      success: true,
      message: validationMessage,
      step_completed: true,
      treasure_hunt_completed: huntCompleted,
      position: completionPosition,
      crown_reward: crownReward,
      stepCompletion: {
        id: completionId,
        user_id: userId,
        step_id,
        treasure_hunt_id,
        validation_data,
        completed_at: completedAt
      },
      progress
    });

  } catch (error) {
    console.error('Error completing step:', error);
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Get user's completed steps for a hunt
steps.get('/completed/:huntId', authMiddleware, async (c) => {
  try {
    const huntId = c.req.param('huntId');
    const userId = c.get('userId');

    const completedSteps = db.prepare(`
      SELECT 
        sc.*,
        s.title as step_title,
        s.step_order
      FROM step_completions sc
      JOIN steps s ON sc.step_id = s.id
      WHERE sc.user_id = ? AND sc.treasure_hunt_id = ?
      ORDER BY s.step_order
    `).all(userId, huntId);

    return c.json({
      completedSteps: completedSteps.map(completion => ({
        id: completion.id,
        user_id: completion.user_id,
        step_id: completion.step_id,
        treasure_hunt_id: completion.treasure_hunt_id,
        validation_data: JSON.parse(completion.validation_data || '{}'),
        completed_at: completion.completed_at,
        step_title: completion.step_title,
        step_order: completion.step_order
      }))
    });

  } catch (error) {
    console.error('Error fetching completed steps:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Create step (hunt planners only)
steps.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    const createSchema = z.object({
      treasure_hunt_id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().optional(),
      validation_type: z.string(),
      validation_value: z.string(),
      order: z.number()
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
      return c.json({ error: 'Only the planner can add steps' }, 403);
    }

    const stepId = uuidv4();
    db.prepare(`
      INSERT INTO steps (id, treasure_hunt_id, title, description, validation_type, validation_value, step_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      stepId, 
      validatedData.treasure_hunt_id, 
      validatedData.title, 
      validatedData.description || null,
      validatedData.validation_type, 
      validatedData.validation_value, 
      validatedData.order
    );

    return c.json({
      message: 'Step created successfully',
      step: { id: stepId, ...validatedData }
    }, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    console.error('Create step error:', error);
    return c.json({ error: 'Failed to create step', details: error.message }, 500);
  }
});

// Update step (hunt planners only)
steps.put('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const stepId = c.req.param('id');
    const body = await c.req.json();

    const updateSchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      validation_type: z.string().optional(),
      validation_value: z.string().optional(),
      order: z.number().optional()
    });

    const validatedData = updateSchema.parse(body);

    // Check if step exists and user is the planner
    const step = db.prepare(`
      SELECT s.*, th.planner 
      FROM steps s
      JOIN treasure_hunts th ON s.treasure_hunt_id = th.id
      WHERE s.id = ?
    `).get(stepId);

    if (!step) {
      return c.json({ error: 'Step not found' }, 404);
    }

    if (step.planner !== user.id) {
      return c.json({ error: 'Only the planner can update steps' }, 403);
    }

    // Update step
    const updateFields = [];
    const updateValues = [];

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'order' ? 'step_order' : key;
        updateFields.push(`${dbKey} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(stepId);
      db.prepare(`UPDATE steps SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
    }

    return c.json({ message: 'Step updated successfully' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    console.error('Update step error:', error);
    return c.json({ error: 'Failed to update step', details: error.message }, 500);
  }
});

// Delete step (hunt planners only)
steps.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const stepId = c.req.param('id');

    // Check if step exists and user is the planner
    const step = db.prepare(`
      SELECT s.*, th.planner 
      FROM steps s
      JOIN treasure_hunts th ON s.treasure_hunt_id = th.id
      WHERE s.id = ?
    `).get(stepId);

    if (!step) {
      return c.json({ error: 'Step not found' }, 404);
    }

    if (step.planner !== user.id) {
      return c.json({ error: 'Only the planner can delete steps' }, 403);
    }

    db.prepare('DELETE FROM steps WHERE id = ?').run(stepId);

    return c.json({ message: 'Step deleted successfully' });

  } catch (error) {
    console.error('Delete step error:', error);
    return c.json({ error: 'Failed to delete step', details: error.message }, 500);
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Distance in meters
}

export { steps as stepRoutes };