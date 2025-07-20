/*
  # Add hunt completion tracking to treasure_hunts_users table

  1. Schema Changes
    - Add `completed_at` column to track when user finished the hunt
    - Add `completion_position` column to track finishing position
    - Add `is_completed` boolean flag for quick queries

  2. Indexes
    - Add index for completion queries
    - Add index for leaderboard queries
*/

-- Add completion tracking columns to treasure_hunts_users table
ALTER TABLE treasure_hunts_users 
ADD COLUMN completed_at TEXT DEFAULT NULL,
ADD COLUMN completion_position INTEGER DEFAULT NULL,
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_treasure_hunts_users_completed 
ON treasure_hunts_users(treasure_hunt_id, is_completed, completed_at);

CREATE INDEX IF NOT EXISTS idx_treasure_hunts_users_position 
ON treasure_hunts_users(treasure_hunt_id, completion_position);

-- Create index for user's completed hunts
CREATE INDEX IF NOT EXISTS idx_treasure_hunts_users_user_completed 
ON treasure_hunts_users(user_id, is_completed);