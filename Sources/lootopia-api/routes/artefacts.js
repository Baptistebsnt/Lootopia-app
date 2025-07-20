import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, optionalAuthMiddleware, adminMiddleware } from '../middleware/auth.js';
import { db } from '../database/init.js';

const artefacts = new Hono();

// Get all artefacts
artefacts.get('/', optionalAuthMiddleware, async (c) => {
  try {
    const artefactsList = db.prepare(`
      SELECT * FROM artefacts ORDER BY created_at DESC
    `).all();

    return c.json({
      artefacts: artefactsList.map(artefact => ({
        id: artefact.id,
        name: artefact.name,
        description: artefact.description,
        rarity: artefact.rarity,
        image_url: artefact.image_url,
        effect: artefact.effect,
        created_at: artefact.created_at
      }))
    });

  } catch (error) {
    console.error('Get artefacts error:', error);
    return c.json({ error: 'Failed to get artefacts' }, 500);
  }
});

// Get specific artefact
artefacts.get('/:id', optionalAuthMiddleware, async (c) => {
  try {
    const artefactId = c.req.param('id');

    const artefact = db.prepare(`
      SELECT * FROM artefacts WHERE id = ?
    `).get(artefactId);

    if (!artefact) {
      return c.json({ error: 'Artefact not found' }, 404);
    }

    return c.json({
      artefact: {
        id: artefact.id,
        name: artefact.name,
        description: artefact.description,
        rarity: artefact.rarity,
        image_url: artefact.image_url,
        effect: artefact.effect,
        created_at: artefact.created_at
      }
    });

  } catch (error) {
    console.error('Get artefact error:', error);
    return c.json({ error: 'Failed to get artefact' }, 500);
  }
});

// Create artefact (admin only)
artefacts.post('/', authMiddleware, adminMiddleware, async (c) => {
  try {
    const body = await c.req.json();

    const createSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      rarity: z.string(),
      image_url: z.string().url().optional(),
      effect: z.string().optional(),
      base_value: z.number().min(1).optional(),
      is_tradeable: z.boolean().optional()
    });

    const validatedData = createSchema.parse(body);

    // Create artefact
    const artefactId = uuidv4();
    db.prepare(`
      INSERT INTO artefacts (id, name, description, rarity, image_url, effect, base_value, is_tradeable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      artefactId,
      validatedData.name,
      validatedData.description || null,
      validatedData.rarity,
      validatedData.image_url || null,
      validatedData.effect || null,
      validatedData.base_value || 100,
      validatedData.is_tradeable !== false ? 1 : 0
    );

    return c.json({
      message: 'Artefact created successfully',
      artefact: {
        id: artefactId,
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
    console.error('Create artefact error:', error);
    return c.json({ error: 'Failed to create artefact' }, 500);
  }
});

// Update artefact (admin only)
artefacts.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const artefactId = c.req.param('id');
    const body = await c.req.json();

    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      rarity: z.string().optional(),
      image_url: z.string().url().optional(),
      effect: z.string().optional()
    });

    const validatedData = updateSchema.parse(body);

    // Check if artefact exists
    const artefact = db.prepare('SELECT id FROM artefacts WHERE id = ?').get(artefactId);
    if (!artefact) {
      return c.json({ error: 'Artefact not found' }, 404);
    }

    // Update artefact
    const updateFields = [];
    const updateValues = [];

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(artefactId);
      db.prepare(`UPDATE artefacts SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
    }

    return c.json({
      message: 'Artefact updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Update artefact error:', error);
    return c.json({ error: 'Failed to update artefact' }, 500);
  }
});

// Delete artefact (admin only)
artefacts.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  try {
    const artefactId = c.req.param('id');

    // Check if artefact exists
    const artefact = db.prepare('SELECT id FROM artefacts WHERE id = ?').get(artefactId);
    if (!artefact) {
      return c.json({ error: 'Artefact not found' }, 404);
    }

    // Delete artefact
    db.prepare('DELETE FROM artefacts WHERE id = ?').run(artefactId);

    return c.json({
      message: 'Artefact deleted successfully'
    });

  } catch (error) {
    console.error('Delete artefact error:', error);
    return c.json({ error: 'Failed to delete artefact' }, 500);
  }
});

export { artefacts as artefactRoutes };