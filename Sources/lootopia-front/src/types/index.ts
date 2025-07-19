export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  crowns: number;
  level: number;
  xp: number;
  badges: Badge[];
  joinDate: string;
  isPremium: boolean;
  lastName?: string;
  surName?: string;
  pseudo?: string;
  role?: string;
  mfa_enabled?: boolean;
  created_at?: string;
}
export interface TreasureHunt {
  id: string;
  name: string;
  title?: string;
  description?: string;
  creator?: string;
  planner?: string;
  planner_name?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  duration?: string;
  participants?: number;
  participants_count?: number;
  maxParticipants?: number;
  rewards?: Reward[];
  location?: string;
  imageUrl?: string;
  category?: string;
  isActive?: boolean;
  entryCost?: number;
  createdAt?: string;
  created_at?: string;
  rating?: number;
  tags?: string[];
  steps?: Step[];
  landmarks?: Landmark[];
  status?: string;
  joined_at?: string;
  completed_at?: string;
  completion_position?: number;
  is_completed?: boolean;
}
export interface Step {
  id: string;
  treasure_hunt_id: string;
  title: string;
  description: string;
  validation_type: "location" | "text" | "qr_code";
  validation_value: string;
  step_order: number;
  order?: number; 
  created_at: string;
  is_completed?: boolean;
  completed_at?: string;
}
export interface StepCompletion {
  id: string;
  user_id: string;
  step_id: string;
  treasure_hunt_id: string;
  validation_data: any;
  completed_at: string;
}
export interface HuntCompletion {
  id: string;
  user_id: string;
  treasure_hunt_id: string;
  completed_at: string;
  completion_position: number;
  total_time?: number;
  total_attempts?: number;
}
export interface HuntProgress {
  treasure_hunt_id: string;
  total_steps: number;
  completed_steps: number;
  completion_percentage: number;
  is_completed: boolean;
  completed_at?: string;
  completion_position?: number;
  next_step?: Step;
}
export interface Landmark {
  id: string;
  latitude: number;
  longitude: number;
  visible_on_map: boolean;
  precision_level: number;
  reward_name?: string;
}
export interface DigAttempt {
  id: string;
  user_id: string;
  user_name?: string;
  treasure_hunt_id: string;
  treasure_hunt_name?: string;
  latitude: number;
  longitude: number;
  success: boolean;
  attempted_at: string;
}
export interface Review {
  id: string;
  user_id: string;
  reviewer_name?: string;
  treasure_hunt_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
export interface ReviewStatistics {
  average_rating: number;
  total_reviews: number;
}
export interface Artifact {
  id: string;
  name: string;
  description: string;
  rarity:
    | "Common"
    | "Rare"
    | "Epic"
    | "Legendary"
    | "common"
    | "uncommon"
    | "rare"
    | "epic"
    | "legendary";
  imageUrl?: string;
  image_url?: string;
  owner?: string;
  price?: number;
  isForSale?: boolean;
  category?: string;
  obtainedFrom?: string;
  obtainedAt?: string;
  obtained_at?: string;
  effect?: string;
}
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "Bronze" | "Silver" | "Gold" | "Diamond";
  obtainedAt: string;
}
export interface Reward {
  type: "crowns" | "artifact" | "badge" | "xp" | "treasure";
  amount?: number;
  item?: Artifact | Badge;
  id?: string;
  name?: string;
  description?: string;
  value?: number;
  rarity?: string;
  created_at?: string;
}
export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  huntsCompleted: number;
  totalRewards: number;
}
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
