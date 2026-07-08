// F:\portfolio-webapp\backend\server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ============ MIDDLEWARE ============
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ✅ Allow requests from file:// (null origin) and localhost
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5001', 
    'https://portfolio-muhammad-ejaz.netlify.app',  
    'https://portfolio-admin.vercel.app'            
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Serve uploaded files with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ============ SUPABASE CONNECTION ============
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============ AUDIT MIDDLEWARE ============
const auditMiddleware = require('./middleware/audit')(supabase);
app.use(auditMiddleware);

// ============ ROUTES ============
app.use('/api/auth', require('./routes/auth')(supabase));
app.use('/api/projects', require('./routes/projects')(supabase));
app.use('/api/videos', require('./routes/videos')(supabase));
app.use('/api/ratings', require('./routes/ratings')(supabase)); // ← ADD THIS LINE
app.use('/api/contacts', require('./routes/contacts')(supabase));
app.use('/api/analytics', require('./routes/analytics')(supabase));
app.use('/api/import', require('./routes/import')(supabase));
app.use('/api/certificates', require('./routes/certificates')(supabase));
app.use('/api/upload', require('./routes/upload')(supabase));

// ============ ROOT ============
app.get('/', (req, res) => {
  res.json({
    name: 'Portfolio 360 API',
    version: '1.0.0',
    status: 'running',
    security: {
      auth: 'Google OAuth + 2FA',
      rateLimit: '5 attempts/15min',
      audit: true
    },
    endpoints: {
      health: '/api/health',
      projects: '/api/projects',
      auth: '/api/auth'
    }
  });
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    security: {
      rateLimit: 'Active',
      audit: 'Active',
      auth: 'Google OAuth + 2FA'
    }
  });
});

// ============ START SERVER ============
const HOST = '0.0.0.0';  // ← Required for Render

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔐 Security: Google OAuth + 2FA + Rate Limiting`);
  console.log(`📊 Health: /api/health`);
});

