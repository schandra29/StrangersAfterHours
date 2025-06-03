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

## Complete Local Development Setup Guide

This guide provides step-by-step instructions to set up and run the Strangers: After Hours application on your local machine.

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js**: Version 18 or later.
- **pnpm**: While `npm` can work, `pnpm` is recommended for this project. Install it via `npm install -g pnpm`.
- **Supabase CLI**: Follow the installation instructions on the [official Supabase documentation](https://supabase.com/docs/guides/cli/getting-started).
- **Git**: For cloning the repository.

### 2. Clone the Repository

Open your terminal and run the following commands:
```bash
git clone https://github.com/your-username/strangers-after-hours.git
cd strangers-after-hours
```
(Replace `your-username` with the actual repository path if different)

### 3. Install Dependencies

From the project root directory (`strangers-after-hours`), install all necessary packages:
```bash
pnpm install
```

### 4. Configure Environment Variables

Create your local environment file by copying the example:
```bash
cp .env.example .env.local
```
Now, open `.env.local` in your text editor and carefully verify or update the following variables:

-   `VITE_SUPABASE_URL`: Should match the API URL provided by `supabase start` (defaults to `http://localhost:54321`).
-   `VITE_SUPABASE_ANON_KEY`: Use the `anon key` provided by `supabase start`.
-   `VITE_SUPABASE_SERVICE_ROLE_KEY`: Use the `service_role key` provided by `supabase start`. (Primarily for admin tasks if the server-side Supabase client is used; the backend mainly uses `DATABASE_URL`).
-   `DATABASE_URL`: This is the connection string for your PostgreSQL database. For local Supabase, it defaults to `postgresql://postgres:postgres@localhost:54321/postgres`.
-   `PORT`: The port for your backend server. Defaults to `3001`.
-   `VITE_API_BASE_URL`: The base URL for client-side API calls to your backend. Should match your backend server's address (e.g., `http://localhost:3001`).
-   `SESSION_SECRET`: **Important!** Change this to a long, random, and secure string. This is crucial for session security.

### 5. Start Supabase Services

In your terminal, from the project root, start the local Supabase services:
```bash
supabase start
```
This command will initialize your local Supabase instance (PostgreSQL database, authentication, etc.). It will output your local Supabase URL, anon key, and service role key. **Ensure these values are correctly set in your `.env.local` file.**

### 6. Set Up the Database

Once Supabase services are running, set up your database schema and seed it with initial data. From the project root, run:
```bash
pnpm db:setup
```
This command executes scripts to create database tables (migrations) and populate them with necessary initial data (seeding), targeting the local Supabase database you just started.

### 7. Run the Application (Requires Two Terminals)

You'll need two separate terminal windows/tabs running concurrently: one for the backend server and one for the frontend client.

**Terminal 1: Start the Backend Server**
Navigate to the project root and run:
```bash
pnpm dev:server
```
This will start the backend (Express.js) server. By default, it should be running on `http://localhost:3001` (as specified by `PORT` in `.env.local`).

**Terminal 2: Start the Frontend Client**
Navigate to the project root and run:
```bash
pnpm dev
```
This will start the Vite development server for the React frontend. By default, it should be running on `http://localhost:5173`. Your browser might open automatically to this address.

### 8. Access the Application

Open your web browser and navigate to:
`http://localhost:5173`

You should now see the Strangers: After Hours application running locally!

### 9. Verification and Troubleshooting

If you encounter issues, here are some common things to check:

-   **Browser Developer Console:** Open your browser's developer tools (usually by pressing F12). Check the "Console" tab for any JavaScript errors or failed network requests.
-   **Network Tab:** In the developer tools, switch to the "Network" tab. Verify that API calls (typically to paths starting with `/api/...`) are being made to your backend URL (e.g., `http://localhost:3001`) and are returning successful status codes (like 200 OK).
-   **Terminal Output:** Check the output in both your backend server terminal and frontend client terminal for any error messages or warnings.
-   **`.env.local` Configuration:** Double-check that all values in your `.env.local` file are correct, especially those obtained from the `supabase start` command. Ensure there are no typos or extra spaces.
-   **Supabase Status:** Make sure the `supabase start` command ran successfully and that the Supabase Docker containers (if listed by `docker ps`) are running.
-   **Port Conflicts:** Ensure that ports `5173`, `3001`, and `54321` (and any others used by Supabase) are not already in use by other applications on your system.

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

## Docker Compose

The `docker-compose.yml` file in this project can be used to run ancillary services like a standalone PostgreSQL database (if you prefer not to use Supabase CLI for local development or need it for other purposes), Redis, or other services. However, the primary local development setup for the application itself relies on running the client and server directly via `pnpm dev` (or `npm run dev`) as described above.

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
