import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authMiddleware } from '../middleware/auth.js';

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    
    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      pseudo: z.string().min(1),
      lastName: z.string().optional(),
      surName: z.string().optional()
    });

    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(validatedData.email);
    if (existingUser) {
      return c.json({ error: 'User already exists with this email' }, 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const userId = uuidv4();
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, pseudo, lastName, surName)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      userId,
      validatedData.email,
      passwordHash,
      validatedData.pseudo,
      validatedData.lastName || null,
      validatedData.surName || null
    );

    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    // Get created user (without password)
    const user = db.prepare(`
      SELECT id, email, pseudo, lastName, surName, role, created_at
      FROM users WHERE id = ?
    `).get(userId);

    return c.json({
      message: 'User registered successfully',
      token,
      user
    }, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Register error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });

    const validatedData = loginSchema.parse(body);

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(validatedData.email);
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Return user data (without password)
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get current user profile
auth.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const { password_hash, ...userWithoutPassword } = user;
    
    return c.json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// Refresh token
auth.post('/refresh', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // Generate new token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return c.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return c.json({ error: 'Failed to refresh token' }, 500);
  }
});

export { auth as authRoutes };