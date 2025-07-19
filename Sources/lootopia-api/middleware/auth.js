import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
      
      if (!user) {
        return c.json({ error: 'User not found' }, 401);
      }

      // Add user info to context
      c.set('user', user);
      c.set('userId', user.id);
      
      await next();
    } catch (jwtError) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

export const optionalAuthMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
        
        if (user) {
          c.set('user', user);
          c.set('userId', user.id);
        }
      } catch (jwtError) {
        // Token is invalid, but we continue without authentication
        console.warn('Invalid token in optional auth:', jwtError.message);
      }
    }
    
    await next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    await next();
  }
};

export const adminMiddleware = async (c, next) => {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  
  await next();
};