import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database
const dbPath = join(__dirname, 'lootopia.db');
const db = new Database(dbPath);

// Function to make a user admin
function makeUserAdmin(email) {
  try {
    const result = db.prepare(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = ?
    `).run(email);

    if (result.changes > 0) {
      console.log(`✅ User with email "${email}" is now an admin!`);
      
      // Get updated user info
      const user = db.prepare(`
        SELECT id, email, pseudo, role 
        FROM users 
        WHERE email = ?
      `).get(email);
      
      console.log('Updated user info:', user);
    } else {
      console.log(`❌ No user found with email "${email}"`);
    }
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    db.close();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email);