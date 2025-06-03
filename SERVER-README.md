# Strangers: After Hours - Server Setup

This document provides instructions for setting up the local development environment for the Strangers: After Hours game server.

## Prerequisites

1. **Node.js** (v18 or later)
2. **Docker Desktop** (for running Supabase locally)
3. **Git** (for version control)
4. **Visual Studio Code** (recommended IDE)

## Local Development Setup

### 1. Clone the Repository

```powershell
git clone https://github.com/yourusername/strangers-after-hours.git
cd strangers-after-hours
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with the following content:

```env
# Supabase
SUPABASE_KEY=your-supabase-key

# Database (Local Supabase)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DATABASE_URL_NON_POOLING=postgresql://postgres:postgres@localhost:54322/postgres

# Supabase (Local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNmi43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# App
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-secret-key-here
```

### 4. Start Local Supabase

```powershell
# Start Supabase services (Docker must be running)
npm run supabase:start

# Initialize the database schema and seed data
npm run db:init
```

### 5. Run the Development Server

```powershell
npm run dev
```

### 6. Access the Application

- **Local Server**: http://localhost:3000
- **Supabase Dashboard**: http://localhost:54323

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run test` - Run tests
- `npm run db:init` - Initialize the database schema and seed data
- `npm run db:reset` - Reset the database (deletes all data)
- `npm run supabase:start` - Start local Supabase services
- `npm run supabase:stop` - Stop local Supabase services

## Project Structure

```
strangers-after-hours/
├── client/                 # Frontend React application
├── server/                 # Backend server code
│   ├── lib/               # Shared utilities
│   ├── services/          # Business logic
│   └── index.ts           # Server entry point
├── shared/                # Shared code between client and server
├── scripts/               # Utility scripts
│   ├── init-db.ts        # Database initialization
│   └── test-db.ts        # Database tests
├── .env.local            # Local environment variables
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Database Schema

The database schema is managed through migrations in the `supabase/migrations` directory. To create a new migration:

```powershell
supabase migration new migration_name
```

## Testing

Run the test suite:

```powershell
npm test
```

Run database integration tests:

```powershell
npm run test:db
```

## Deployment

### Prerequisites

1. Set up a Supabase project at https://app.supabase.com
2. Get your project URL and API keys
3. Set up environment variables in your hosting provider

### Deployment Steps

1. Build the application:
   ```powershell
   npm run build
   ```

2. Start the production server:
   ```powershell
   npm start
   ```

## Troubleshooting

### Database Connection Issues

1. Make sure Docker is running
2. Verify Supabase services are running:
   ```powershell
   docker ps
   ```
3. Check the logs:
   ```powershell
   supabase logs
   ```

### Environment Variables

Make sure all required environment variables are set in `.env.local` and match your Supabase project settings.

## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes and write tests
3. Run the test suite
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
