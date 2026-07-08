// F:\portfolio-webapp\backend\routes\projects.js
const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

  // ============ GET ALL PROJECTS ============
  router.get('/', async (req, res) => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get ratings for each project
      const projectsWithRatings = await Promise.all(
        projects.map(async (project) => {
          const { data: ratings, error: ratingError } = await supabase
            .from('ratings')
            .select('rating')
            .eq('project_id', project.id)
            .eq('is_approved', true);

          if (ratingError) {
            console.error('Rating error:', ratingError);
            return { ...project, avg_rating: 0, rating_count: 0 };
          }

          const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

          return {
            ...project,
            avg_rating: Math.round(avgRating * 10) / 10,
            rating_count: ratings.length
          };
        })
      );

      res.json(projectsWithRatings);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET SINGLE PROJECT BY ID ============
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get ratings
      const { data: ratings, error: ratingError } = await supabase
        .from('ratings')
        .select('*')
        .eq('project_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (ratingError) {
        console.error('Rating error:', ratingError);
        return res.json({ ...project, ratings: [], avg_rating: 0 });
      }

      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      // Get videos
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('project_id', id);

      if (videoError) {
        console.error('Video error:', videoError);
      }

      // Increment view count
      await supabase
        .from('projects')
        .update({ views: (project.views || 0) + 1 })
        .eq('id', id);

      res.json({
        ...project,
        avg_rating: Math.round(avgRating * 10) / 10,
        rating_count: ratings.length,
        ratings: ratings || [],
        videos: videos || []
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ CREATE PROJECT (Admin Only) ============
  router.post('/', async (req, res) => {
    try {
      const { 
        title, description, category, technologies, 
        live_url, github_url, video_url, thumbnail_url, featured 
      } = req.body;

      // Validate
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert([
          {
            title,
            description,
            category,
            technologies: technologies || [],
            live_url: live_url || null,
            github_url: github_url || null,
            video_url: video_url || null,
            thumbnail_url: thumbnail_url || null,
            featured: featured || false,
            rating_count: 0,
            rating_sum: 0,
            views: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(project);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ UPDATE PROJECT (Admin Only) ============
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove id from updates
      delete updates.id;
      delete updates.created_at;

      // Add updated_at
      updates.updated_at = new Date().toISOString();

      const { data: project, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ DELETE PROJECT (Admin Only) ============
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Delete related videos first
      await supabase
        .from('videos')
        .delete()
        .eq('project_id', id);

      // Delete related ratings
      await supabase
        .from('ratings')
        .delete()
        .eq('project_id', id);

      // Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET PROJECTS BY CATEGORY ============
  router.get('/category/:category', async (req, res) => {
    try {
      const { category } = req.params;

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(projects);
    } catch (error) {
      console.error('Get projects by category error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET FEATURED PROJECTS ============
  router.get('/featured', async (req, res) => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      res.json(projects);
    } catch (error) {
      console.error('Get featured projects error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
