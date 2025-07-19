import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
const dbPath = join(__dirname, 'lootopia.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Utility to check if a column exists in a table
function columnExists(table, column) {
  const stmt = db.prepare(`PRAGMA table_info(${table})`);
  const columns = stmt.all();
  return columns.some(col => col.name === column);
}

function insertSampleData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Sample data already exists, skipping insertion');
    return;
  }

  // ... reste du code inchangé ...
}

export async function initializeDatabase() {
  try {
    // Create tables
    createTables();
    console.log('Database tables created successfully');

    // Insert sample data
    insertSampleData();
    console.log('Sample data inserted successfully');

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      pseudo TEXT,
      lastName TEXT,
      surName TEXT,
      role TEXT DEFAULT 'user',
      crown_balance INTEGER DEFAULT 1000,
      mfa_enabled BOOLEAN DEFAULT FALSE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS treasure_hunts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      planner TEXT NOT NULL,
      planner_name TEXT,
      participants_count INTEGER DEFAULT 0,
      entry_cost INTEGER DEFAULT 0,
      crown_reward INTEGER DEFAULT 100,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT DEFAULT NULL,
      FOREIGN KEY (planner) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      treasure_hunt_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      validation_type TEXT NOT NULL,
      validation_value TEXT,
      step_order INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (treasure_hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS treasure_hunts_users (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      treasure_hunt_id TEXT NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT DEFAULT NULL,
      completion_position INTEGER DEFAULT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      entry_fee_paid INTEGER DEFAULT 0,
      crown_reward_earned INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (treasure_hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE,
      UNIQUE(user_id, treasure_hunt_id)
    );

    CREATE TABLE IF NOT EXISTS step_completions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      treasure_hunt_id TEXT NOT NULL,
      validation_data TEXT,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE,
      FOREIGN KEY (treasure_hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE,
      UNIQUE(user_id, step_id)
    );

    CREATE TABLE IF NOT EXISTS winners (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      treasure_hunt_id TEXT NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      position INTEGER NOT NULL,
      crown_reward INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (treasure_hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE,
      UNIQUE(user_id, treasure_hunt_id)
    );

    CREATE TABLE IF NOT EXISTS crown_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT,
      reference_type TEXT,
      reference_id TEXT,
      balance_before INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS artefacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      rarity TEXT NOT NULL,
      image_url TEXT,
      effect TEXT,
      base_value INTEGER DEFAULT 100,
      is_tradeable BOOLEAN DEFAULT TRUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS marketplace_items (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL,
      artefact_id TEXT NOT NULL,
      price INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      listed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sold_at TEXT DEFAULT NULL,
      buyer_id TEXT DEFAULT NULL,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (artefact_id) REFERENCES artefacts(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS dig_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      treasure_hunt_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      success BOOLEAN DEFAULT FALSE,
      attempted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (treasure_hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      treasure_hunt_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (treasure_hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE,
      UNIQUE(user_id, treasure_hunt_id)
    );

    CREATE TABLE IF NOT EXISTS user_artefacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      artefact_id TEXT NOT NULL,
      obtained_at TEXT DEFAULT CURRENT_TIMESTAMP,
      obtained_from TEXT,
      is_listed BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (artefact_id) REFERENCES artefacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      treasure_hunt_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT,
      description TEXT,
      value INTEGER,
      rarity TEXT,
      artefact_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (treasure_hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE,
      FOREIGN KEY (artefact_id) REFERENCES artefacts(id) ON DELETE SET NULL
    );
  `);

  // Add missing column only if it doesn't exist
  if (!columnExists('treasure_hunts', 'image_url')) {
    db.exec(`ALTER TABLE treasure_hunts ADD COLUMN image_url TEXT DEFAULT NULL`);
  }

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_treasure_hunts_planner ON treasure_hunts(planner);
    CREATE INDEX IF NOT EXISTS idx_steps_hunt ON steps(treasure_hunt_id, step_order);
    CREATE INDEX IF NOT EXISTS idx_treasure_hunts_users_user ON treasure_hunts_users(user_id);
    CREATE INDEX IF NOT EXISTS idx_treasure_hunts_users_hunt ON treasure_hunts_users(treasure_hunt_id);
    CREATE INDEX IF NOT EXISTS idx_step_completions_user_hunt ON step_completions(user_id, treasure_hunt_id);
    CREATE INDEX IF NOT EXISTS idx_winners_hunt_position ON winners(treasure_hunt_id, position);
    CREATE INDEX IF NOT EXISTS idx_dig_attempts_user ON dig_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_dig_attempts_hunt ON dig_attempts(treasure_hunt_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_hunt ON reviews(treasure_hunt_id);
    CREATE INDEX IF NOT EXISTS idx_user_artefacts_user ON user_artefacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_crown_transactions_user ON crown_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_crown_transactions_type ON crown_transactions(transaction_type);
    CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller ON marketplace_items(seller_id);
    CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
  `);
}
