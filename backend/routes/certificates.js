// F:\portfolio-webapp\backend\routes\certificates.js
const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

  // ============ GET ALL CERTIFICATES ============
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Get certificates error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET FEATURED CERTIFICATES ============
  router.get('/featured', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('featured', true)
        .order('issue_date', { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Get featured certificates error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ CREATE CERTIFICATE ============
  router.post('/', async (req, res) => {
    try {
      const { title, issuer, issue_date, expiry_date, credential_url, image_url, category, featured } = req.body;

      // ✅ Validate required fields
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // ✅ Convert empty strings to null
      const data = {
        title: title.trim(),
        issuer: issuer || null,
        issue_date: issue_date || null,
        expiry_date: expiry_date || null,
        credential_url: credential_url || null,
        image_url: image_url || null,
        category: category || 'Azure',
        featured: featured || false
      };

      const { data: result, error } = await supabase
        .from('certificates')
        .insert([data])
        .select();

      if (error) throw error;
      res.status(201).json(result[0]);
    } catch (error) {
      console.error('Create certificate error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ UPDATE CERTIFICATE ============
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, issuer, issue_date, expiry_date, credential_url, image_url, category, featured } = req.body;

      // ✅ Validate required fields
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // ✅ Convert empty strings to null
      const updates = {
        title: title.trim(),
        issuer: issuer || null,
        issue_date: issue_date || null,
        expiry_date: expiry_date || null,
        credential_url: credential_url || null,
        image_url: image_url || null,
        category: category || 'Azure',
        featured: featured || false
      };

      const { data, error } = await supabase
        .from('certificates')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Certificate not found' });
      }
      
      res.json(data[0]);
    } catch (error) {
      console.error('Update certificate error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ DELETE CERTIFICATE ============
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true, message: 'Certificate deleted successfully' });
    } catch (error) {
      console.error('Delete certificate error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
