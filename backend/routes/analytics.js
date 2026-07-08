// F:\portfolio-webapp\backend\routes\analytics.js
const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

  // ============ GET DASHBOARD STATS ============
  router.get('/dashboard', async (req, res) => {
    try {
      // Get project stats
      const { data: projects, error: pError } = await supabase
        .from('projects')
        .select('id, title, rating_count, views, rating_sum')
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      // Get video stats
      const { data: videos, error: vError } = await supabase
        .from('videos')
        .select('id, views');

      if (vError) {
        console.error('Video stats error:', vError);
      }

      // Get rating stats
      const { data: ratings, error: rError } = await supabase
        .from('ratings')
        .select('id, rating, is_approved, created_at');

      if (rError) {
        console.error('Rating stats error:', rError);
      }

      // Get contact stats
      const { data: contacts, error: cError } = await supabase
        .from('contacts')
        .select('id, is_read, created_at')
        .order('created_at', { ascending: false });

      if (cError) {
        console.error('Contact stats error:', cError);
      }

      // Get skill stats
      const { data: skills, error: sError } = await supabase
        .from('skills')
        .select('*')
        .order('progress', { ascending: false });

      if (sError) {
        console.error('Skill stats error:', sError);
      }

      // Calculate stats
      const approvedRatings = ratings?.filter(r => r.is_approved) || [];
      const totalRatingSum = approvedRatings.reduce((sum, r) => sum + r.rating, 0);
      const totalRatings = approvedRatings.length;

      const stats = {
        totalProjects: projects?.length || 0,
        totalVideos: videos?.length || 0,
        totalRatings: totalRatings,
        totalContacts: contacts?.length || 0,
        unreadContacts: contacts?.filter(c => !c.is_read).length || 0,
        totalViews: videos?.reduce((sum, v) => sum + (v.views || 0), 0) || 0,
        avgRating: totalRatings > 0 ? Math.round((totalRatingSum / totalRatings) * 10) / 10 : 0,
        skills: skills || [],
        recentProjects: projects?.slice(0, 5) || [],
        recentContacts: contacts?.slice(0, 5) || [],
        recentRatings: approvedRatings.slice(0, 5) || [],
        // Growth metrics
        projectsThisMonth: projects?.filter(p => {
          const date = new Date(p.created_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length || 0,
        ratingsThisMonth: approvedRatings.filter(r => {
          const date = new Date(r.created_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length || 0,
        contactsThisMonth: contacts?.filter(c => {
          const date = new Date(c.created_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length || 0
      };

      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET ACTIVITY CHART DATA ============
  router.get('/activity', async (req, res) => {
    try {
      // Get last 30 days of activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get all analytics events
      const { data: analytics, error } = await supabase
        .from('analytics')
        .select('action, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Analytics fetch error:', error);
        // Fallback: use ratings and contacts as activity
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('ratings')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (fallbackError) {
          return res.json([]);
        }

        // Group by date
        const grouped = {};
        fallbackData?.forEach(item => {
          const date = new Date(item.created_at).toLocaleDateString();
          if (!grouped[date]) {
            grouped[date] = { date, views: 0, ratings: 0, contacts: 0 };
          }
          grouped[date].ratings++;
        });

        const chartData = Object.values(grouped);
        return res.json(chartData);
      }

      // Group by date
      const grouped = {};
      
      analytics?.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString();
        if (!grouped[date]) {
          grouped[date] = { date, views: 0, ratings: 0, contacts: 0 };
        }
        if (item.action === 'view') grouped[date].views++;
        if (item.action === 'rate') grouped[date].ratings++;
        if (item.action === 'contact') grouped[date].contacts++;
      });

      // Also include ratings and contacts from their tables
      const { data: ratings, error: rError } = await supabase
        .from('ratings')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!rError && ratings) {
        ratings.forEach(item => {
          const date = new Date(item.created_at).toLocaleDateString();
          if (!grouped[date]) {
            grouped[date] = { date, views: 0, ratings: 0, contacts: 0 };
          }
          grouped[date].ratings++;
        });
      }

      const { data: contacts, error: cError } = await supabase
        .from('contacts')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!cError && contacts) {
        contacts.forEach(item => {
          const date = new Date(item.created_at).toLocaleDateString();
          if (!grouped[date]) {
            grouped[date] = { date, views: 0, ratings: 0, contacts: 0 };
          }
          grouped[date].contacts++;
        });
      }

      const chartData = Object.values(grouped).sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      res.json(chartData);
    } catch (error) {
      console.error('Activity chart error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ TRACK VIEW ============
  router.post('/track', async (req, res) => {
    try {
      const { page, action, metadata } = req.body;
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';

      const { error } = await supabase
        .from('analytics')
        .insert([
          {
            page: page || 'unknown',
            action: action || 'view',
            metadata: metadata || {},
            ip_address: ip
          }
        ]);

      if (error) {
        console.error('Track error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Track error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET SKILLS PROGRESS ============
  router.get('/skills', async (req, res) => {
    try {
      const { data: skills, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('progress', { ascending: false });

      if (error) throw error;
      res.json(skills);
    } catch (error) {
      console.error('Get skills error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ UPDATE SKILL PROGRESS (Admin Only) ============
  router.put('/skills/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { progress } = req.body;

      if (progress === undefined || progress < 0 || progress > 100) {
        return res.status(400).json({ error: 'Progress must be between 0 and 100' });
      }

      const { data: skill, error } = await supabase
        .from('skills')
        .update({ 
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(404).json({ error: 'Skill not found' });
      }

      res.json(skill);
    } catch (error) {
      console.error('Update skill error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};