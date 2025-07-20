import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { db } from '../database/init.js';

const reviews = new Hono();

// Get reviews for a treasure hunt
reviews.get('/treasure-hunt/:huntId', optionalAuthMiddleware, async (c) => {
  try {
    const huntId = c.req.param('huntId');

    const reviewsList = db.prepare(`
      SELECT 
        r.*,
        u.pseudo as reviewer_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.treasure_hunt_id = ?
      ORDER BY r.created_at DESC
    `).all(huntId);

    // Get review statistics
    const stats = db.prepare(`
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews
      FROM reviews
      WHERE treasure_hunt_id = ?
    `).get(huntId);

    return c.json({
      reviews: reviewsList.map(review => ({
        id: review.id,
        user_id: review.user_id,
        reviewer_name: review.reviewer_name,
        treasure_hunt_id: review.treasure_hunt_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at
      })),
      statistics: {
        average_rating: stats.average_rating || 0,
        total_reviews: stats.total_reviews || 0
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return c.json({ error: 'Failed to get reviews' }, 500);
  }
});

// Create review
reviews.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    const createSchema = z.object({
      treasure_hunt_id: z.string().uuid(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional()
    });

    const validatedData = createSchema.parse(body);

    // Check if treasure hunt exists
    const hunt = db.prepare(`
      SELECT id FROM treasure_hunts WHERE id = ? AND deleted_at IS NULL
    `).get(validatedData.treasure_hunt_id);

    if (!hunt) {
      return c.json({ error: 'Treasure hunt not found' }, 404);
    }

    // Check if user has already reviewed this hunt
    const existingReview = db.prepare(`
      SELECT id FROM reviews WHERE user_id = ? AND treasure_hunt_id = ?
    `).get(user.id, validatedData.treasure_hunt_id);

    if (existingReview) {
      return c.json({ error: 'You have already reviewed this treasure hunt' }, 400);
    }

    // Create review
    const reviewId = uuidv4();
    db.prepare(`
      INSERT INTO reviews (id, user_id, treasure_hunt_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      reviewId,
      user.id,
      validatedData.treasure_hunt_id,
      validatedData.rating,
      validatedData.comment || null
    );

    return c.json({
      message: 'Review created successfully',
      review: {
        id: reviewId,
        user_id: user.id,
        treasure_hunt_id: validatedData.treasure_hunt_id,
        rating: validatedData.rating,
        comment: validatedData.comment,
        created_at: new Date().toISOString()
      }
    }, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Create review error:', error);
    return c.json({ error: 'Failed to create review' }, 500);
  }
});

// Update review
reviews.put('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const reviewId = c.req.param('id');
    const body = await c.req.json();

    const updateSchema = z.object({
      rating: z.number().min(1).max(5).optional(),
      comment: z.string().optional()
    });

    const validatedData = updateSchema.parse(body);

    // Check if review exists and belongs to user
    const review = db.prepare(`
      SELECT * FROM reviews WHERE id = ? AND user_id = ?
    `).get(reviewId, user.id);

    if (!review) {
      return c.json({ error: 'Review not found or you do not have permission to update it' }, 404);
    }

    // Update review
    const updateFields = [];
    const updateValues = [];

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(reviewId);
      db.prepare(`UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
    }

    return c.json({
      message: 'Review updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Update review error:', error);
    return c.json({ error: 'Failed to update review' }, 500);
  }
});

// Delete review
reviews.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const reviewId = c.req.param('id');

    // Check if review exists and belongs to user
    const review = db.prepare(`
      SELECT * FROM reviews WHERE id = ? AND user_id = ?
    `).get(reviewId, user.id);

    if (!review) {
      return c.json({ error: 'Review not found or you do not have permission to delete it' }, 404);
    }

    // Delete review
    db.prepare('DELETE FROM reviews WHERE id = ?').run(reviewId);

    return c.json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    return c.json({ error: 'Failed to delete review' }, 500);
  }
});

export { reviews as reviewRoutes };