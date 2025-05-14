import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { pool } from './db';

// Create a PostgreSQL session store
const PgStore = pgSession(session);

// Create a random session secret
const SESSION_SECRET = process.env.SESSION_SECRET || 'random_secret_key_' + Math.random().toString(36).substring(2, 15);

// Configure session middleware
export const sessionMiddleware = session({
  store: new PgStore({
    pool,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: false, // Set to false for both dev and prod for easier testing
    sameSite: 'lax'
  }
});

// Middleware to check if user is authenticated
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};