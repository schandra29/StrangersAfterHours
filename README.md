# Strangers: After Hours

A party game that helps people connect through meaningful conversations.

## Features

- 3 different decks (Strangers, Friends, BFFs) with 150 prompts each (450 total)
- 3 levels of depth: Icebreaker, Getting to Know You, Deeper Dive
- 3 intensity levels: Mild, Moderate, Bold
- 50% Indian-specific, 50% universal prompts
- Activity breaks every 4 prompts
- Reflection pauses every 10 prompts
- Unlockable prompt packs after completing sets of prompts
- Alternating between solo and group prompts

## Current Development Focus

### Activity Breaks and Reflection Pauses

We've recently implemented activity breaks and reflection pauses to enhance the game experience:

- **Activity Breaks**: Short interactive activities that appear after every 4 prompts
  - Stored in the `activity_breaks` table
  - Can be deck-specific or universal
  - Include title, description, and duration
  - Frontend renders with blue styling and a "Complete Activity" button

- **Reflection Pauses**: Moments for players to reflect on their conversations, appearing after every 10 prompts
  - Stored in the `reflection_pauses` table
  - Can be deck-specific or universal
  - Include title, description, and duration
  - Frontend renders with purple styling and a "Continue Playing" button

### Testing Challenges (For Consultant Review)

We're currently facing the following testing challenges:

1. **Browser Preview Issues**: The browser preview functionality returns 404 errors, preventing interactive testing
2. **Test Script Output**: Our test scripts execute without errors but don't produce visible console output
3. **Database Seeding Verification**: We can't confirm if test data is successfully inserted into the database

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (Frontend), Supabase (Database)

## Prerequisites

- Node.js (v18 or later)
- pnpm (recommended) or npm
- PostgreSQL (or Supabase for local development)
- Supabase CLI (for local development)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/strangers-after-hours.git
cd strangers-after-hours
```

### 2. Install dependencies

Using pnpm (recommended):

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update the values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase and database credentials.

### 4. Set up Supabase (Local Development)

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start the local Supabase stack:
   ```bash
   npm run supabase:start
   ```

3. Initialize the database (run migrations and seed data):
   ```bash
   npm run db:setup
   ```

### 5. Run the development server

```bash
# Start the Vite dev server
npm run dev

# In a separate terminal, start the backend server
npm run dev:server
```

The app should now be running at `http://localhost:5173`.

## Database Management

### Running Migrations

To create and run new migrations:

```bash
# Generate a new migration file
npm run db:generate

# Apply pending migrations
npm run db:migrate
```

### Seeding the Database

To seed the database with sample data:

```bash
npm run db:seed
```

### Resetting the Database

To completely reset the database (be careful, this will delete all data):

```bash
npm run db:reset
```

## Project Structure

```
strangers-after-hours/
├── client/            # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   │   └── GameScreen.tsx   # Handles rendering of all content types
│   │   ├── hooks/
│   │   │   └── useGame.ts      # Game state and API integration
│   │   └── pages/
│   │       └── Home.tsx        # Main game page
├── server/            # Backend Express server
│   └── src/
│       └── controllers/
│           └── gameSessionController.ts  # Handles game flow logic
├── scripts/           # Utility scripts
│   ├── seed-content.ts          # Seeds activity breaks and reflection pauses
│   ├── verify-game-flow.ts      # Tests game flow with different content types
│   └── check-content-tables.ts  # Verifies database tables
├── shared/            # Shared code between client and server
│   ├── schema.ts                # Main database schema
│   └── game-schema.ts           # Activity breaks and reflection pauses schema
├── supabase/
│   └── migrations/              # Database migrations
├── .env.example       # Example environment variables
├── .env               # Environment variables (gitignored)
├── package.json
└── tsconfig.json
```

## Key Files for Testing Activity Breaks and Reflection Pauses

### Frontend
- `client/src/components/GameScreen.tsx` - Renders different UI for each content type
- `client/src/hooks/useGame.ts` - Manages game state and API calls
- `client/src/pages/Home.tsx` - Integrates components and hooks

### Backend
- `server/src/controllers/gameSessionController.ts` - Logic for content selection
- `shared/game-schema.ts` - Database schema for activity breaks and reflection pauses

### Testing
- `scripts/seed-content.ts` - Seeds test data
- `scripts/verify-game-flow.ts` - Tests game flow logic
- `scripts/check-content-tables.ts` - Verifies database tables

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

MIT

---

Happy connecting! 🎉
