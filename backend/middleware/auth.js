// F:\portfolio-webapp\backend\middleware\auth.js
const jwt = require('jsonwebtoken');

module.exports = (supabase) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

  // ============ AUTHENTICATE USER ============
  const authenticate = async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      res.status(500).json({ error: 'Authentication failed' });
    }
  };

  // ============ CHECK ADMIN ROLE ============
  const isAdmin = async (req, res, next) => {
    try {
      // First authenticate
      await authenticate(req, res, async () => {
        // Check if user is admin
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access required' });
        }
        next();
      });
    } catch (error) {
      console.error('Admin check error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };

  // ============ OPTIONAL AUTH (Public routes with optional user) ============
  const optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        req.user = null;
        return next();
      }

      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  };

  // ============ GET CURRENT USER ============
  const getCurrentUser = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  };

  return {
    authenticate,
    isAdmin,
    optionalAuth,
    getCurrentUser
  };
};
