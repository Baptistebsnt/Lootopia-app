# Lootopia Backend API

A complete Node.js backend API for the Lootopia treasure hunting platform, built with Hono framework and SQLite database.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Treasure Hunts**: Create, join, and manage treasure hunting adventures
- **Step Completion**: Track user progress through hunt steps with validation
- **Dig Attempts**: Record and track user dig attempts with success/failure
- **Reviews & Ratings**: User reviews and ratings for treasure hunts
- **Artefacts & Rewards**: Collectible items and reward system
- **Real-time Progress**: Track completion status and leaderboards

## 🛠️ Tech Stack

- **Framework**: Hono (Fast, lightweight web framework)
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod schema validation
- **Runtime**: Node.js

## 📁 Project Structure

```
backend/
├── server.js              # Main server entry point
├── package.json           # Dependencies and scripts
├── database/
│   ├── init.js            # Database initialization and schema
│   └── lootopia.db        # SQLite database file (auto-generated)
├── middleware/
│   └── auth.js            # Authentication middleware
└── routes/
    ├── auth.js            # Authentication endpoints
    ├── users.js           # User management endpoints
    ├── treasureHunts.js   # Treasure hunt endpoints
    ├── steps.js           # Step management and completion
    ├── digAttempts.js     # Dig attempt tracking
    ├── reviews.js         # Review and rating system
    ├── rewards.js         # Reward management
    └── artefacts.js       # Artefact management
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Production Start

```bash
npm start
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/treasure-hunts` - Get user's joined hunts
- `GET /api/users/artefacts` - Get user's collected artefacts
- `GET /api/users/dig-attempts` - Get user's dig attempt history

### Treasure Hunt Endpoints

- `GET /api/treasure-hunts` - Get all treasure hunts (paginated)
- `GET /api/treasure-hunts/:id` - Get specific treasure hunt
- `POST /api/treasure-hunts` - Create new treasure hunt
- `POST /api/treasure-hunts/:id/join` - Join a treasure hunt
- `GET /api/treasure-hunts/:id/progress` - Get user's hunt progress
- `GET /api/treasure-hunts/user/completed` - Get user's completed hunts

### Step Endpoints

- `GET /api/steps/treasure-hunt/:huntId` - Get steps for a hunt (with user progress)
- `GET /api/steps/treasure-hunt/:huntId/public` - Get steps (public, no progress)
- `GET /api/steps/progress/:huntId` - Get detailed progress for a hunt
- `POST /api/steps/:stepId/complete` - Complete a step
- `POST /api/steps` - Create new step (hunt planners only)
- `PUT /api/steps/:id` - Update step (hunt planners only)
- `DELETE /api/steps/:id` - Delete step (hunt planners only)

### Dig Attempt Endpoints

- `GET /api/dig-attempts/user` - Get user's dig attempts
- `GET /api/dig-attempts/treasure-hunt/:huntId` - Get dig attempts for a hunt
- `POST /api/dig-attempts` - Create new dig attempt

### Review Endpoints

- `GET /api/reviews/treasure-hunt/:huntId` - Get reviews for a hunt
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Reward & Artefact Endpoints

- `GET /api/rewards` - Get all rewards
- `GET /api/rewards/:id` - Get specific reward
- `POST /api/rewards` - Create reward (hunt planners only)
- `GET /api/artefacts` - Get all artefacts
- `GET /api/artefacts/:id` - Get specific artefact
- `POST /api/artefacts` - Create artefact (admin only)
- `PUT /api/artefacts/:id` - Update artefact (admin only)
- `DELETE /api/artefacts/:id` - Delete artefact (admin only)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

The API uses SQLite with the following main tables:

- `users` - User accounts and profiles
- `treasure_hunts` - Treasure hunt definitions
- `steps` - Individual steps within hunts
- `treasure_hunts_users` - User participation and completion tracking
- `step_completions` - Individual step completion records
- `winners` - Hunt completion leaderboard
- `dig_attempts` - User dig attempt history
- `reviews` - User reviews and ratings
- `artefacts` - Collectible items
- `user_artefacts` - User's collected artefacts
- `rewards` - Hunt rewards and prizes

## 🔧 Configuration

Key environment variables:

- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins

## 🧪 Sample Data

The database is automatically initialized with sample data including:

- Sample users (admin@lootopia.com, hunter@lootopia.com)
- Sample treasure hunts
- Sample steps and artefacts
- Default password for sample users: `password123`

## 🚀 Deployment

1. Set environment variables for production
2. Ensure SQLite database permissions
3. Use a process manager like PM2 for production
4. Configure reverse proxy (nginx) if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details