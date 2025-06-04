import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key', 
      (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        
        req.user = user;
        next();
      }
    );
  } else {
    res.sendStatus(401);
  }
};

// Mock user for development
export const mockAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    req.user = {
      id: 1,
      username: 'dev-user'
    };
    return next();
  }
  next(new Error('Mock auth only available in development'));
};
