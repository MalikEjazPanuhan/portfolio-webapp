// F:\portfolio-webapp\frontend\src\components\Admin\RatingsManager.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStar, FaTrash, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const RatingsManager = () => {
  const { token } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ratings/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRatings(response.data);
    } catch (error) {
      console.error('Fetch ratings error:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, isApproved) => {
    try {
      await axios.put(`${API_URL}/ratings/${id}/approve`, 
        { is_approved: isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✅ Rating ${isApproved ? 'approved' : 'hidden'}`);
      fetchRatings();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to update rating');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) return;
    try {
      await axios.delete(`${API_URL}/ratings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Rating deleted successfully!');
      fetchRatings();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete rating');
    }
  };

  const getFilteredRatings = () => {
    if (filter === 'all') return ratings;
    if (filter === 'approved') return ratings.filter(r => r.is_approved);
    if (filter === 'pending') return ratings.filter(r => !r.is_approved);
    return ratings;
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar 
            key={star} 
            className={star <= rating ? 'star-filled' : 'star-empty'} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ratings...</p>
      </div>
    );
  }

  const filteredRatings = getFilteredRatings();

  return (
    <div className="ratings-manager">
      <div className="page-header">
        <div>
          <h1>⭐ Ratings & Comments</h1>
          <p>Manage user ratings and feedback for your projects</p>
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({ratings.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({ratings.filter(r => r.is_approved).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({ratings.filter(r => !r.is_approved).length})
          </button>
        </div>
      </div>

      <div className="ratings-list">
        {filteredRatings.length === 0 ? (
          <div className="empty-state">
            <p>No ratings found.</p>
          </div>
        ) : (
          filteredRatings.map((rating) => (
            <div key={rating.id} className="rating-item-admin">
              <div className="rating-item-header">
                <div className="rating-user">
                  <div className="user-avatar-small">
                    <FaUser />
                  </div>
                  <div>
                    <strong>{rating.visitor_name || 'Anonymous'}</strong>
                    {rating.visitor_email && (
                      <span className="user-email-small">{rating.visitor_email}</span>
                    )}
                  </div>
                </div>
                <div className="rating-status">
                  {renderStars(rating.rating)}
                  <span className={`status-badge ${rating.is_approved ? 'approved' : 'pending'}`}>
                    {rating.is_approved ? '✅ Approved' : '⏳ Pending'}
                  </span>
                </div>
              </div>
              <div className="rating-item-body">
                <p className="rating-comment">{rating.comment || 'No comment provided'}</p>
                <div className="rating-meta">
                  <span className="rating-project">
                    📁 {rating.projects?.title || 'Unknown project'}
                  </span>
                  <span className="rating-date">
                    {new Date(rating.created_at).toLocaleDateString()} at{' '}
                    {new Date(rating.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="rating-item-actions">
                {!rating.is_approved ? (
                  <button 
                    className="btn-approve" 
                    onClick={() => handleApprove(rating.id, true)}
                  >
                    <FaCheck /> Approve
                  </button>
                ) : (
                  <button 
                    className="btn-hide" 
                    onClick={() => handleApprove(rating.id, false)}
                  >
                    <FaTimes /> Hide
                  </button>
                )}
                <button 
                  className="btn-delete" 
                  onClick={() => handleDelete(rating.id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingsManager;
