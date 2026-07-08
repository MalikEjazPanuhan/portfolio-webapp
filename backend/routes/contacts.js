// F:\portfolio-webapp\backend\routes\contacts.js
const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

  // ============ GET ALL CONTACTS (Admin Only) ============
  router.get('/', async (req, res) => {
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(contacts);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GET UNREAD CONTACTS COUNT ============
  router.get('/unread/count', async (req, res) => {
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('id', { count: 'exact' })
        .eq('is_read', false);

      if (error) throw error;
      res.json({ unread: contacts?.length || 0 });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ SUBMIT CONTACT FORM ============
  router.post('/', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      // Insert contact
      const { data: contact, error } = await supabase
        .from('contacts')
        .insert([
          {
            name,
            email,
            subject: subject || 'New message from portfolio',
            message,
            is_read: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: 'Message sent successfully!',
        contact
      });
    } catch (error) {
      console.error('Submit contact error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ MARK CONTACT AS READ (Admin Only) ============
  router.put('/:id/read', async (req, res) => {
    try {
      const { id } = req.params;

      const { data: contact, error } = await supabase
        .from('contacts')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({ success: true, contact });
    } catch (error) {
      console.error('Mark contact read error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ DELETE CONTACT (Admin Only) ============
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
