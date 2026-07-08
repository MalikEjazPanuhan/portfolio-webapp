// F:\portfolio-webapp\frontend\src\components\Admin\ContactsManager.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaTrash, FaCheck, FaUser, FaCalendar, FaEye } from 'react-icons/fa';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ContactsManager = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, read, unread

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Fetch contacts error:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`${API_URL}/contacts/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Message marked as read');
      fetchContacts();
    } catch (error) {
      console.error('Mark read error:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await axios.delete(`${API_URL}/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Message deleted successfully!');
      fetchContacts();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    if (!contact.is_read) {
      handleMarkRead(contact.id);
    }
  };

  const getFilteredContacts = () => {
    if (filter === 'all') return contacts;
    if (filter === 'read') return contacts.filter(c => c.is_read);
    if (filter === 'unread') return contacts.filter(c => !c.is_read);
    return contacts;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading contacts...</p>
      </div>
    );
  }

  const filteredContacts = getFilteredContacts();
  const unreadCount = contacts.filter(c => !c.is_read).length;

  return (
    <div className="contacts-manager">
      <div className="page-header">
        <div>
          <h1>📬 Contact Messages</h1>
          <p>Manage messages from visitors</p>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({contacts.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({contacts.filter(c => c.is_read).length})
          </button>
        </div>
      </div>

      <div className="contacts-list">
        {filteredContacts.length === 0 ? (
          <div className="empty-state">
            <p>No messages found.</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`contact-item ${!contact.is_read ? 'unread' : ''}`}
              onClick={() => handleView(contact)}
            >
              <div className="contact-item-header">
                <div className="contact-user">
                  <div className="user-avatar-small">
                    <FaUser />
                  </div>
                  <div>
                    <strong>{contact.name}</strong>
                    <span className="contact-email">{contact.email}</span>
                  </div>
                </div>
                <div className="contact-status">
                  {!contact.is_read && <span className="status-badge unread">New</span>}
                  <span className="contact-date">
                    <FaCalendar /> {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="contact-item-body">
                <h4>{contact.subject || 'No subject'}</h4>
                <p>{contact.message?.slice(0, 150)}...</p>
              </div>
              <div className="contact-item-actions" onClick={(e) => e.stopPropagation()}>
                {!contact.is_read && (
                  <button 
                    className="btn-approve" 
                    onClick={() => handleMarkRead(contact.id)}
                  >
                    <FaCheck /> Mark as Read
                  </button>
                )}
                <button 
                  className="btn-delete" 
                  onClick={() => handleDelete(contact.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📩 Message Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="contact-detail">
              <div className="detail-row">
                <label>From:</label>
                <div>
                  <strong>{selectedContact.name}</strong>
                  <span className="detail-email">{selectedContact.email}</span>
                </div>
              </div>
              <div className="detail-row">
                <label>Subject:</label>
                <span>{selectedContact.subject || 'No subject'}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{new Date(selectedContact.created_at).toLocaleString()}</span>
              </div>
              <div className="detail-row message-row">
                <label>Message:</label>
                <p>{selectedContact.message}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button 
                className="btn-delete" 
                onClick={() => {
                  handleDelete(selectedContact.id);
                  setShowModal(false);
                }}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsManager;
