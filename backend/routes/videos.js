// F:\portfolio-webapp\backend\routes\videos.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (supabase) => {
  
  // ============ MULTER CONFIGURATION ============
  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Please upload MP4, WebM, OGG, or MOV.'), false);
    }
  };

  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
  });

  // ============ GET ALL VIDEOS ============
  router.get('/', async (req, res) => {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*, projects(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(videos);
    } catch (error) {
      console.error('Get videos error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET VIDEOS BY PROJECT ============
  router.get('/project/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;

      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(videos);
    } catch (error) {
      console.error('Get project videos error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ UPLOAD VIDEO (Admin Only) ============
  router.post('/', upload.single('video'), async (req, res) => {
    try {
      const { title, description, project_id, category } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No video uploaded' });
      }

      // Validate project exists
      if (project_id) {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('id', project_id)
          .single();

        if (projectError) {
          // Delete uploaded file if project doesn't exist
          fs.unlinkSync(req.file.path);
          return res.status(404).json({ error: 'Project not found' });
        }
      }

      // Create video record in database
      const videoData = {
        title: title || req.file.originalname,
        description: description || '',
        project_id: project_id || null,
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        thumbnail: req.body.thumbnail || null,
        duration: req.body.duration || '00:00',
        category: category || 'demo',
        views: 0
      };

      const { data: video, error } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (error) {
        // Delete uploaded file if database insert fails
        fs.unlinkSync(req.file.path);
        throw error;
      }

      res.status(201).json(video);
    } catch (error) {
      console.error('Upload video error:', error);
      // Clean up uploaded file if error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ============ UPDATE VIDEO METADATA (Admin Only) ============
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, project_id, category } = req.body;

      const { data: video, error } = await supabase
        .from('videos')
        .update({ 
          title, 
          description, 
          project_id, 
          category,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json(video);
    } catch (error) {
      console.error('Update video error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ INCREMENT VIDEO VIEWS ============
  router.post('/:id/view', async (req, res) => {
    try {
      const { id } = req.params;

      const { data: video, error } = await supabase
        .from('videos')
        .update({ views: supabase.raw('views + 1') })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json({ success: true, views: video.views });
    } catch (error) {
      console.error('Video view error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ DELETE VIDEO (Admin Only) ============
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Get video record to find file
      const { data: video, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Delete file from filesystem
      if (video.path) {
        const filePath = path.join(__dirname, '..', video.path);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
