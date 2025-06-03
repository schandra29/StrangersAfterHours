# Development Guide

This document contains useful information for setting up and working on the Strangers: After Hours project.

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Docker and Docker Compose (for local development)
- Supabase CLI (for local Supabase development)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/strangers-after-hours.git
   cd strangers-after-hours
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your local configuration.

4. **Start the development environment**
   ```bash
   # Start all services (PostgreSQL, Redis, etc.)
   docker-compose up -d
   
   # Start the development server
   pnpm dev
   ```

## Available Scripts

### Database

- `pnpm db:generate` - Generate a new migration
- `pnpm db:migrate` - Run pending migrations
- `pnpm db:reset` - Reset the database (drops all tables and re-runs migrations)
- `pnpm db:seed` - Seed the database with test data
- `pnpm db:check` - Check database connection

### Development

- `pnpm dev` - Start the development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview the production build locally
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests

### Docker

- `docker-compose up -d` - Start all services
- `docker-compose down` - Stop all services
- `docker-compose logs -f` - View logs
- `docker-compose exec db psql -U postgres` - Access PostgreSQL shell

## Project Structure

```
strangers-after-hours/
├── src/                    # Source files
│   ├── components/         # Reusable React components
│   ├── lib/                # Library code
│   │   ├── db/            # Database configuration and models
│   │   └── supabase/      # Supabase client and auth
│   ├── pages/             # Page components
│   ├── styles/            # Global styles and themes
│   └── utils/             # Utility functions
├── supabase/              # Supabase configuration and migrations
├── public/                # Static files
├── scripts/               # Utility scripts
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

## Database Migrations

1. **Create a new migration**
   ```bash
   pnpm db:generate migration_name
   ```

2. **Apply migrations**
   ```bash
   pnpm db:migrate
   ```

3. **Reset the database**
   ```bash
   pnpm db:reset
   ```

## Testing

Run the test suite:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## Deployment

### Production

1. Set up environment variables in your hosting provider
2. Build the application:
   ```bash
   pnpm build
   ```
3. Start the production server:
   ```bash
   pnpm start
   ```

### Vercel

This project is configured for deployment on Vercel. Just connect your repository and configure the following environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## Code Style

- Use TypeScript for type safety
- Follow the Airbnb JavaScript Style Guide
- Use Prettier for code formatting
- Use ESLint for code quality

## Git Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push your branch and create a pull request

## Troubleshooting

### Database Connection Issues

- Make sure PostgreSQL is running
- Check that the connection string in `.env.local` is correct
- Try resetting the database: `pnpm db:reset`

### Dependency Issues

- Delete `node_modules` and `pnpm-lock.yaml` (or `package-lock.json`)
- Run `pnpm install` (or `npm install`)

## License

MIT
