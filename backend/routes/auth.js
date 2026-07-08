// F:\portfolio-webapp\backend\routes\auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

module.exports = (supabase) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

  // ============ LOGIN ============
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !users) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const valid = await bcrypt.compare(password, users.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: users.id, 
          email: users.email, 
          role: users.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Check if 2FA is enabled
      const { data: twofa, error: twofaError } = await supabase
        .from('twofa')
        .select('*')
        .eq('user_id', users.id)
        .single();

      res.json({
        token,
        user: {
          id: users.id,
          email: users.email,
          full_name: users.full_name,
          role: users.role
        },
        twofa_enabled: !!twofa
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // ============ LOGIN WITH 2FA ============
  router.post('/login-2fa', async (req, res) => {
    try {
      const { email, password, token } = req.body;

      if (!email || !password || !token) {
        return res.status(400).json({ error: 'Email, password, and 2FA token are required' });
      }

      // Find user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get 2FA secret
      const { data: twofa, error: twofaError } = await supabase
        .from('twofa')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (twofaError || !twofa) {
        return res.status(401).json({ error: '2FA not set up for this user' });
      }

      // Verify TOTP
      const verified = speakeasy.totp.verify({
        secret: twofa.secret,
        encoding: 'base32',
        token: token,
        window: 1
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('2FA Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // ============ SETUP 2FA ============
  router.post('/2fa/setup', async (req, res) => {
    try {
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Generate 2FA secret
      const secret = speakeasy.generateSecret({
        name: `Portfolio 360 (${req.user?.email || 'admin'})`
      });

      // Store secret in database
      const { data: existing, error: checkError } = await supabase
        .from('twofa')
        .select('*')
        .eq('user_id', user_id)
        .single();

      let twofaData;
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('twofa')
          .update({ 
            secret: secret.base32,
            enabled: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
          .select()
          .single();
        twofaData = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('twofa')
          .insert([{
            user_id: user_id,
            secret: secret.base32,
            enabled: false
          }])
          .select()
          .single();
        twofaData = data;
      }

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      res.json({
        success: true,
        secret: secret.base32,
        qrCode: qrCode,
        otpauth_url: secret.otpauth_url
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ error: 'Failed to setup 2FA' });
    }
  });

  // ============ VERIFY AND ENABLE 2FA ============
  router.post('/2fa/verify', async (req, res) => {
    try {
      const { user_id, token } = req.body;

      if (!user_id || !token) {
        return res.status(400).json({ error: 'User ID and token are required' });
      }

      // Get 2FA secret
      const { data: twofa, error } = await supabase
        .from('twofa')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (error || !twofa) {
        return res.status(404).json({ error: '2FA not set up for this user' });
      }

      // Verify TOTP
      const verified = speakeasy.totp.verify({
        secret: twofa.secret,
        encoding: 'base32',
        token: token,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ error: 'Invalid 2FA code' });
      }

      // Enable 2FA
      await supabase
        .from('twofa')
        .update({ 
          enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);

      res.json({
        success: true,
        message: '2FA enabled successfully'
      });
    } catch (error) {
      console.error('2FA verify error:', error);
      res.status(500).json({ error: 'Failed to verify 2FA' });
    }
  });

  // ============ DISABLE 2FA ============
  router.post('/2fa/disable', async (req, res) => {
    try {
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      await supabase
        .from('twofa')
        .update({ 
          enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);

      res.json({
        success: true,
        message: '2FA disabled successfully'
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ error: 'Failed to disable 2FA' });
    }
  });

  // ============ VERIFY TOKEN ============
  router.get('/verify', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({ valid: true, user });
    } catch (error) {
      console.error('Verify error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // ============ CREATE ADMIN USER (First Time Setup) ============
  router.post('/setup', async (req, res) => {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const { data: user, error } = await supabase
        .from('users')
        .insert([{ 
          email, 
          password_hash, 
          full_name, 
          role: 'admin' 
        }])
        .select()
        .single();

      if (error) {
        console.error('Setup error:', error);
        return res.status(400).json({ error: error.message });
      }

      res.json({ 
        success: true, 
        message: 'Admin created successfully',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Setup error:', error);
      res.status(500).json({ error: 'Failed to create admin user' });
    }
  });

  return router;
};
