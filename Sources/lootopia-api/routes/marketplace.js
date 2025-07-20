import { Hono } from 'hono';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { db } from '../database/init.js';

const marketplace = new Hono();

// Get all marketplace items
marketplace.get('/', optionalAuthMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    const rarity = c.req.query('rarity');
    const minPrice = parseInt(c.req.query('minPrice') || '0');
    const maxPrice = parseInt(c.req.query('maxPrice') || '999999');

    let whereClause = 'WHERE mi.status = "active"';
    const params = [];

    if (rarity && rarity !== 'all') {
      whereClause += ' AND a.rarity = ?';
      params.push(rarity);
    }

    whereClause += ' AND mi.price >= ? AND mi.price <= ?';
    params.push(minPrice, maxPrice);

    const items = db.prepare(`
      SELECT 
        mi.*,
        a.name as artefact_name,
        a.description as artefact_description,
        a.rarity,
        a.image_url,
        a.effect,
        a.base_value,
        u.pseudo as seller_name
      FROM marketplace_items mi
      JOIN artefacts a ON mi.artefact_id = a.id
      JOIN users u ON mi.seller_id = u.id
      ${whereClause}
      ORDER BY mi.listed_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM marketplace_items mi
      JOIN artefacts a ON mi.artefact_id = a.id
      ${whereClause}
    `).get(...params).count;

    return c.json({
      items: items.map(item => ({
        id: item.id,
        seller_id: item.seller_id,
        seller_name: item.seller_name,
        artefact: {
          id: item.artefact_id,
          name: item.artefact_name,
          description: item.artefact_description,
          rarity: item.rarity,
          image_url: item.image_url,
          effect: item.effect,
          base_value: item.base_value
        },
        price: item.price,
        status: item.status,
        listed_at: item.listed_at
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get marketplace items error:', error);
    return c.json({ error: 'Failed to get marketplace items' }, 500);
  }
});

// Get user's marketplace listings
marketplace.get('/my-listings', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    const listings = db.prepare(`
      SELECT 
        mi.*,
        a.name as artefact_name,
        a.description as artefact_description,
        a.rarity,
        a.image_url,
        a.effect,
        a.base_value,
        b.pseudo as buyer_name
      FROM marketplace_items mi
      JOIN artefacts a ON mi.artefact_id = a.id
      LEFT JOIN users b ON mi.buyer_id = b.id
      WHERE mi.seller_id = ?
      ORDER BY mi.listed_at DESC
    `).all(user.id);

    return c.json({
      listings: listings.map(listing => ({
        id: listing.id,
        artefact: {
          id: listing.artefact_id,
          name: listing.artefact_name,
          description: listing.artefact_description,
          rarity: listing.rarity,
          image_url: listing.image_url,
          effect: listing.effect,
          base_value: listing.base_value
        },
        price: listing.price,
        status: listing.status,
        listed_at: listing.listed_at,
        sold_at: listing.sold_at,
        buyer_name: listing.buyer_name
      }))
    });

  } catch (error) {
    console.error('Get user listings error:', error);
    return c.json({ error: 'Failed to get user listings' }, 500);
  }
});

// List an artefact for sale
marketplace.post('/list', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    const listSchema = z.object({
      user_artefact_id: z.string().min(1),
      price: z.number().min(1)
    });

    const validatedData = listSchema.parse(body);

    // Check if user owns this artefact and it's not already listed
    const userArtefact = db.prepare(`
      SELECT ua.*, a.name, a.is_tradeable
      FROM user_artefacts ua
      JOIN artefacts a ON ua.artefact_id = a.id
      WHERE ua.id = ? AND ua.user_id = ? AND ua.is_listed = FALSE
    `).get(validatedData.user_artefact_id, user.id);

    if (!userArtefact) {
      return c.json({ error: 'Artefact not found or already listed' }, 404);
    }

    if (!userArtefact.is_tradeable) {
      return c.json({ error: 'This artefact cannot be traded' }, 400);
    }

    // Create marketplace listing
    const listingId = uuidv4();
    
    // Start transaction
    const transaction = db.transaction(() => {
      // Create marketplace item
      db.prepare(`
        INSERT INTO marketplace_items (id, seller_id, artefact_id, price)
        VALUES (?, ?, ?, ?)
      `).run(listingId, user.id, userArtefact.artefact_id, validatedData.price);

      // Mark artefact as listed
      db.prepare(`
        UPDATE user_artefacts SET is_listed = TRUE WHERE id = ?
      `).run(validatedData.user_artefact_id);
    });

    transaction();

    return c.json({
      message: 'Artefact listed successfully',
      listing: {
        id: listingId,
        artefact_name: userArtefact.name,
        price: validatedData.price,
        listed_at: new Date().toISOString()
      }
    }, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, 400);
    }
    console.error('List artefact error:', error);
    return c.json({ error: 'Failed to list artefact' }, 500);
  }
});

// Purchase an artefact
marketplace.post('/purchase/:itemId', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const itemId = c.req.param('itemId');

    // Get marketplace item
    const item = db.prepare(`
      SELECT 
        mi.*,
        a.name as artefact_name,
        a.rarity,
        u.pseudo as seller_name
      FROM marketplace_items mi
      JOIN artefacts a ON mi.artefact_id = a.id
      JOIN users u ON mi.seller_id = u.id
      WHERE mi.id = ? AND mi.status = 'active'
    `).get(itemId);

    if (!item) {
      return c.json({ error: 'Marketplace item not found or no longer available' }, 404);
    }

    if (item.seller_id === user.id) {
      return c.json({ error: 'You cannot purchase your own item' }, 400);
    }

    // Check if buyer has enough crowns
    if (user.crown_balance < item.price) {
      return c.json({ 
        error: 'Insufficient crowns', 
        required: item.price,
        available: user.crown_balance
      }, 400);
    }

    const soldAt = new Date().toISOString();

    // Start transaction for purchase
    const transaction = db.transaction(() => {
      // Update marketplace item as sold
      db.prepare(`
        UPDATE marketplace_items 
        SET status = 'sold', buyer_id = ?, sold_at = ?
        WHERE id = ?
      `).run(user.id, soldAt, itemId);

      // Transfer artefact ownership
      db.prepare(`
        UPDATE user_artefacts 
        SET user_id = ?, is_listed = FALSE, obtained_at = ?, obtained_from = ?
        WHERE artefact_id = ? AND user_id = ? AND is_listed = TRUE
      `).run(user.id, soldAt, `marketplace_purchase_${itemId}`, item.artefact_id, item.seller_id);

      // Update buyer's crown balance
      const buyerBalanceBefore = user.crown_balance;
      const buyerBalanceAfter = buyerBalanceBefore - item.price;
      
      db.prepare(`
        UPDATE users SET crown_balance = ? WHERE id = ?
      `).run(buyerBalanceAfter, user.id);

      // Record buyer's transaction
      db.prepare(`
        INSERT INTO crown_transactions (
          id, user_id, transaction_type, amount, description, 
          reference_type, reference_id, balance_before, balance_after
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        user.id,
        'spend',
        item.price,
        `Purchased ${item.artefact_name} from ${item.seller_name}`,
        'marketplace_purchase',
        itemId,
        buyerBalanceBefore,
        buyerBalanceAfter
      );

      // Update seller's crown balance
      const seller = db.prepare('SELECT crown_balance FROM users WHERE id = ?').get(item.seller_id);
      const sellerBalanceBefore = seller.crown_balance;
      const sellerBalanceAfter = sellerBalanceBefore + item.price;
      
      db.prepare(`
        UPDATE users SET crown_balance = ? WHERE id = ?
      `).run(sellerBalanceAfter, item.seller_id);

      // Record seller's transaction
      db.prepare(`
        INSERT INTO crown_transactions (
          id, user_id, transaction_type, amount, description, 
          reference_type, reference_id, balance_before, balance_after
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        item.seller_id,
        'earn',
        item.price,
        `Sold ${item.artefact_name} to ${user.pseudo}`,
        'marketplace_sale',
        itemId,
        sellerBalanceBefore,
        sellerBalanceAfter
      );
    });

    transaction();

    return c.json({
      message: 'Purchase successful!',
      purchase: {
        item_id: itemId,
        artefact_name: item.artefact_name,
        price: item.price,
        seller_name: item.seller_name,
        purchased_at: soldAt
      },
      new_crown_balance: user.crown_balance - item.price
    });

  } catch (error) {
    console.error('Purchase artefact error:', error);
    return c.json({ error: 'Failed to purchase artefact' }, 500);
  }
});

// Cancel a listing
marketplace.delete('/cancel/:itemId', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const itemId = c.req.param('itemId');

    // Check if item exists and belongs to user
    const item = db.prepare(`
      SELECT mi.*, a.name as artefact_name
      FROM marketplace_items mi
      JOIN artefacts a ON mi.artefact_id = a.id
      WHERE mi.id = ? AND mi.seller_id = ? AND mi.status = 'active'
    `).get(itemId, user.id);

    if (!item) {
      return c.json({ error: 'Listing not found or you do not have permission to cancel it' }, 404);
    }

    // Start transaction
    const transaction = db.transaction(() => {
      // Update marketplace item as cancelled
      db.prepare(`
        UPDATE marketplace_items SET status = 'cancelled' WHERE id = ?
      `).run(itemId);

      // Mark artefact as not listed
      db.prepare(`
        UPDATE user_artefacts 
        SET is_listed = FALSE 
        WHERE artefact_id = ? AND user_id = ? AND is_listed = TRUE
      `).run(item.artefact_id, user.id);
    });

    transaction();

    return c.json({
      message: 'Listing cancelled successfully',
      artefact_name: item.artefact_name
    });

  } catch (error) {
    console.error('Cancel listing error:', error);
    return c.json({ error: 'Failed to cancel listing' }, 500);
  }
});

// Get crown transaction history
marketplace.get('/transactions', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const transactions = db.prepare(`
      SELECT * FROM crown_transactions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(user.id, limit, offset);

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM crown_transactions WHERE user_id = ?
    `).get(user.id).count;

    return c.json({
      transactions: transactions.map(tx => ({
        id: tx.id,
        transaction_type: tx.transaction_type,
        amount: tx.amount,
        description: tx.description,
        reference_type: tx.reference_type,
        reference_id: tx.reference_id,
        balance_before: tx.balance_before,
        balance_after: tx.balance_after,
        created_at: tx.created_at
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return c.json({ error: 'Failed to get transactions' }, 500);
  }
});

export { marketplace as marketplaceRoutes };