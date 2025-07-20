-- Add step_completions table for tracking completed steps
CREATE TABLE IF NOT EXISTS step_completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  treasure_hunt_id TEXT NOT NULL,
  validation_data TEXT, -- JSON string containing validation details
  completed_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE,
  FOREIGN KEY (treasure_hunt_id) REFERENCES treasure_hunts(id) ON DELETE CASCADE,
  UNIQUE(user_id, step_id) -- Prevent duplicate completions
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_step_completions_user_hunt 
ON step_completions(user_id, treasure_hunt_id);

CREATE INDEX IF NOT EXISTS idx_step_completions_step 
ON step_completions(step_id);

-- Update winners table to include position
ALTER TABLE winners ADD COLUMN position INTEGER DEFAULT 1;

-- Create index for winners position
CREATE INDEX IF NOT EXISTS idx_winners_hunt_position 
ON winners(treasure_hunt_id, position);