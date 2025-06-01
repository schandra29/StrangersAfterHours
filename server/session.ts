import session from 'express-session';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'strangers-after-hours-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Remove authentication middleware - allow all requests
export const isAuthenticated = (req: any, res: any, next: any) => {
  next(); // Always allow access
};