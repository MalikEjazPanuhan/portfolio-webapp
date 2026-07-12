// F:\portfolio-webapp\backend\routes\certificates.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

module.exports = (supabase) => {
  
  // Use memory storage for direct upload to Supabase
  const storage = multer.memoryStorage();
  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Please upload JPEG, PNG, GIF, or WEBP.'), false);
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  // ============ GET ALL CERTIFICATES ============
  router.get('/', async (req, res) => {
    try {
      const { data: certificates, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(certificates);
    } catch (error) {
      console.error('Get certificates error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ UPLOAD CERTIFICATE ============
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      const { title, issuer, issue_date, featured } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      // Upload to Supabase Storage
      const fileExt = path.extname(req.file.originalname);
      const fileName = `cert_${Date.now()}${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload certificate to storage' });
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      // Create record in database (without 'filename' column)
      const certificateData = {
        title: title || 'Certificate',
        issuer: issuer || '',
        issue_date: issue_date || null,
        image_url: publicUrl, // store full public URL
        featured: featured === 'true' || featured === true ? true : false
        // ✅ 'filename' removed – column doesn't exist
      };

      const { data: certificate, error: dbError } = await supabase
        .from('certificates')
        .insert([certificateData])
        .select()
        .single();

      if (dbError) {
        // Rollback: delete uploaded file from Supabase
        await supabase.storage.from('certificates').remove([fileName]);
        console.error('Database insert error:', dbError);
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json(certificate);
    } catch (error) {
      console.error('Upload certificate error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ UPDATE CERTIFICATE (Admin Only) ============
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, issuer, issue_date, featured } = req.body;

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (issuer !== undefined) updates.issuer = issuer;
      if (issue_date !== undefined) updates.issue_date = issue_date;
      if (featured !== undefined) updates.featured = featured === 'true' || featured === true;

      const { data: certificate, error } = await supabase
        .from('certificates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        return res.status(404).json({ error: 'Certificate not found' });
      }

      res.json(certificate);
    } catch (error) {
      console.error('Update certificate error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ DELETE CERTIFICATE ============
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Delete from database only (storage cleanup skipped)
      const { error: dbError } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      res.json({ success: true });
    } catch (error) {
      console.error('Delete certificate error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
