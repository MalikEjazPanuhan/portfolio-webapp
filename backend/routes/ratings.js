// F:\portfolio-webapp\backend\routes\ratings.js
const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

  // ============ SUBMIT RATING ============
  router.post('/', async (req, res) => {
    try {
      const { project_id, rating, comment, visitor_name } = req.body;

      if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Check if project exists
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, rating_count, rating_sum')
        .eq('id', project_id)
        .single();

      if (projectError) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Insert rating
      const { data: newRating, error } = await supabase
        .from('ratings')
        .insert([{
          project_id,
          rating,
          comment: comment || null,
          visitor_name: visitor_name || 'Anonymous',
          is_approved: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        return res.status(400).json({ error: error.message });
      }

      // ✅ FIX: Update project stats manually
      const newCount = (project.rating_count || 0) + 1;
      const newSum = (project.rating_sum || 0) + rating;

      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({
          rating_count: newCount,
          rating_sum: newSum
        })
        .eq('id', project_id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
      }

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully!',
        rating: newRating,
        project: updatedProject
      });

    } catch (error) {
      console.error('Submit rating error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET RATINGS FOR A PROJECT ============
  router.get('/project/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;

      const { data: ratings, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(ratings);
    } catch (error) {
      console.error('Get ratings error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET ALL RATINGS (Admin Only) ============
  router.get('/admin/all', async (req, res) => {
    try {
      const { data: ratings, error } = await supabase
        .from('ratings')
        .select('*, projects(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(ratings);
    } catch (error) {
      console.error('Get all ratings error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ DELETE RATING (Admin Only) ============
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'Rating deleted' });
    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
