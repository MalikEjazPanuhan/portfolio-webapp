// F:\portfolio-webapp\frontend\src\components\Admin\Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaProjectDiagram, FaVideo, FaStar, FaEnvelope, 
  FaEye, FaChartLine, FaUserPlus, FaPlus 
} from 'react-icons/fa';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Dashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  
  // Card Management
  const [dashboardCards, setDashboardCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);

  const defaultCards = [
    { id: 'projects', title: 'Projects', icon: '📁', color: '#6C63FF' },
    { id: 'videos', title: 'Videos', icon: '🎬', color: '#00D4FF' },
    { id: 'ratings', title: 'Ratings', icon: '⭐', color: '#FFD93D' },
    { id: 'contacts', title: 'Contacts', icon: '📬', color: '#FF6B6B' },
    { id: 'views', title: 'Views', icon: '👁️', color: '#00C853' },
    { id: 'analytics', title: 'Analytics', icon: '📊', color: '#FF9800' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-cards');
    if (saved) {
      setDashboardCards(JSON.parse(saved));
    } else {
      setDashboardCards(defaultCards);
    }
  }, []);

  useEffect(() => {
    if (dashboardCards.length > 0) {
      localStorage.setItem('dashboard-cards', JSON.stringify(dashboardCards));
    }
  }, [dashboardCards]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/analytics/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setActivityData(activityRes.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Card Management Functions
  const handleDeleteCard = (id) => {
    if (!window.confirm('Delete this card?')) return;
    const newCards = dashboardCards.filter(c => c.id !== id);
    setDashboardCards(newCards);
    toast.success('Card removed');
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowCardModal(true);
  };

  const handleSaveCard = (updatedCard) => {
    const newCards = dashboardCards.map(c => 
      c.id === updatedCard.id ? updatedCard : c
    );
    setDashboardCards(newCards);
    setShowCardModal(false);
    toast.success('Card updated');
  };

  const handleAddCard = () => {
    const newCard = {
      id: Date.now().toString(),
      title: 'New Card',
      icon: '📌',
      color: '#6C63FF'
    };
    setDashboardCards([...dashboardCards, newCard]);
    toast.success('Card added');
  };

  const handleResetCards = () => {
    if (!window.confirm('Reset to default cards?')) return;
    setDashboardCards(defaultCards);
    toast.success('Cards reset');
  };

  // Stat values mapping
  const statValues = {
    projects: stats?.totalProjects || 0,
    videos: stats?.totalVideos || 0,
    ratings: stats?.totalRatings || 0,
    contacts: stats?.totalContacts || 0,
    views: stats?.totalViews || 0,
    analytics: stats?.ratingsThisMonth || 0,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Welcome back! Here's an overview of your portfolio performance.</p>
      </div>

      {/* Card Controls */}
      <div className="card-controls">
        <button onClick={handleAddCard} className="btn-primary">
          <FaPlus /> Add Card
        </button>
        <button onClick={handleResetCards} className="btn-secondary">
          🔄 Reset Cards
        </button>
      </div>

      {/* Stats Grid with Manageable Cards */}
      <div className="stats-grid">
        {dashboardCards.map((card) => (
          <div key={card.id} className="stat-card card-manageable">
            <div className="stat-icon" style={{ color: card.color }}>
              <span>{card.icon}</span>
            </div>
            <div className="stat-info">
              <h3>{statValues[card.id] || 0}</h3>
              <p>{card.title}</p>
            </div>
            <div className="card-actions">
              <button onClick={() => handleEditCard(card)} className="btn-edit-sm" title="Edit Card">
                ✏️
              </button>
              <button onClick={() => handleDeleteCard(card.id)} className="btn-delete-sm" title="Delete Card">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="chart-row">
        <div className="chart-card full">
          <h3>📈 Activity Overview (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#6A6A8A" />
              <YAxis stroke="#6A6A8A" />
              <Tooltip 
                contentStyle={{ 
                  background: '#12122A', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  color: '#FFFFFF'
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="views" 
                stackId="1" 
                stroke="#6C63FF" 
                fill="#6C63FF" 
                fillOpacity={0.6} 
                name="Views"
              />
              <Area 
                type="monotone" 
                dataKey="ratings" 
                stackId="1" 
                stroke="#FFD93D" 
                fill="#FFD93D" 
                fillOpacity={0.6} 
                name="Ratings"
              />
              <Area 
                type="monotone" 
                dataKey="contacts" 
                stackId="1" 
                stroke="#00C853" 
                fill="#00C853" 
                fillOpacity={0.6} 
                name="Contacts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills & Growth */}
      <div className="chart-row">
        <div className="chart-card half">
          <h3>🧠 Skills Progress</h3>
          <div className="skills-progress">
            {stats?.skills?.slice(0, 8).map((skill) => (
              <div key={skill.id} className="skill-progress-item">
                <div className="skill-label">
                  <span>{skill.name}</span>
                  <span>{skill.progress}%</span>
                </div>
                <div className="skill-bar">
                  <div 
                    className="skill-bar-fill" 
                    style={{ 
                      width: `${skill.progress}%`,
                      background: skill.color || '#6C63FF'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card half">
          <h3>📚 Learning Growth</h3>
          <div className="growth-stats">
            <div className="growth-item">
              <span className="growth-icon">🏆</span>
              <div className="growth-info">
                <h4>46 Badges</h4>
                <p>Microsoft Learn</p>
                <span className="growth-change">+7 this year</span>
              </div>
            </div>
            <div className="growth-item">
              <span className="growth-icon">📜</span>
              <div className="growth-info">
                <h4>7 Trophies</h4>
                <p>Azure Achievements</p>
                <span className="growth-change">+2 recent</span>
              </div>
            </div>
            <div className="growth-item">
              <span className="growth-icon">🎯</span>
              <div className="growth-info">
                <h4>Azure AI Engineer Expert</h4>
                <p>Next Goal</p>
                <span className="growth-change">In progress</span>
              </div>
            </div>
            <div className="growth-item">
              <span className="growth-icon">📈</span>
              <div className="growth-info">
                <h4>12+ ML Projects</h4>
                <p>Annual Goal</p>
                <span className="growth-change">{stats?.projectsThisMonth || 0} completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="chart-row">
        <div className="chart-card half">
          <h3>📬 Recent Contacts</h3>
          <div className="recent-list">
            {stats?.recentContacts?.slice(0, 5).map((contact) => (
              <div key={contact.id} className="recent-item">
                <div className="recent-icon"><FaEnvelope /></div>
                <div className="recent-content">
                  <h4>{contact.name}</h4>
                  <p>{contact.subject || 'New message'}</p>
                  <small>{new Date(contact.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
            {(!stats?.recentContacts || stats.recentContacts.length === 0) && (
              <p className="no-data">No contacts yet</p>
            )}
          </div>
        </div>

        <div className="chart-card half">
          <h3>🔥 Popular Projects</h3>
          <div className="recent-list">
            {stats?.recentProjects?.slice(0, 5).map((project) => (
              <div key={project.id} className="recent-item">
                <div className="recent-icon"><FaProjectDiagram /></div>
                <div className="recent-content">
                  <h4>{project.title}</h4>
                  <p>⭐ {project.rating_count || 0} ratings · 👁️ {project.views || 0} views</p>
                  <small>Created: {new Date(project.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
            {(!stats?.recentProjects || stats.recentProjects.length === 0) && (
              <p className="no-data">No projects yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Card Modal */}
      {showCardModal && editingCard && (
        <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Card</h2>
              <button className="modal-close" onClick={() => setShowCardModal(false)}>×</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingCard.title}
                  onChange={(e) => setEditingCard({...editingCard, title: e.target.value})}
                  placeholder="Card Title"
                />
              </div>
              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input
                  type="text"
                  value={editingCard.icon}
                  onChange={(e) => setEditingCard({...editingCard, icon: e.target.value})}
                  placeholder="📁"
                  maxLength="2"
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={editingCard.color}
                  onChange={(e) => setEditingCard({...editingCard, color: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowCardModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={() => handleSaveCard(editingCard)}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
