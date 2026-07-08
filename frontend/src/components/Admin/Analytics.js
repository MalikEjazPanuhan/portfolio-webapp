// F:\portfolio-webapp\frontend\src\components\Admin\Analytics.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaChartLine, FaProjectDiagram, FaStar, FaEye, 
  FaUserPlus, FaCalendar, FaDownload, FaFilter 
} from 'react-icons/fa';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Analytics = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [skills, setSkills] = useState([]);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, skillsRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/analytics/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/analytics/skills`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setActivityData(activityRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6C63FF', '#00D4FF', '#FF6B6B', '#FFD93D', '#00C853', '#FF9800'];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Prepare pie chart data
  const projectCategories = stats?.recentProjects?.reduce((acc, p) => {
    const cat = p.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {}) || {};

  const pieData = Object.keys(projectCategories).map(key => ({
    name: key,
    value: projectCategories[key]
  }));

  // Radar chart data for skills
  const radarData = skills?.map(skill => ({
    subject: skill.name,
    score: skill.progress,
    fullMark: 100
  })) || [];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>📊 Analytics</h1>
          <p>Deep insights into your portfolio performance</p>
        </div>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button className="btn-export" onClick={() => toast.info('Export feature coming soon!')}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FaEye /></div>
          <div className="stat-info">
            <h3>{stats?.totalViews || 0}</h3>
            <p>Total Views</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaStar /></div>
          <div className="stat-info">
            <h3>{stats?.avgRating || 0} ★</h3>
            <p>Average Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaProjectDiagram /></div>
          <div className="stat-info">
            <h3>{stats?.totalProjects || 0}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaUserPlus /></div>
          <div className="stat-info">
            <h3>{stats?.totalContacts || 0}</h3>
            <p>Total Contacts</p>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="chart-row">
        <div className="chart-card full">
          <h3>📈 Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#6A6A8A" />
              <YAxis stroke="#6A6A8A" />
              <Tooltip 
                contentStyle={{ 
                  background: '#12122A', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px'
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

      {/* Charts Grid */}
      <div className="chart-row">
        <div className="chart-card half">
          <h3>📊 Project Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card half">
          <h3>🧠 Skills Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData.length > 0 ? radarData : [{ subject: 'No Data', score: 0, fullMark: 100 }]}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" stroke="#A0A0C0" tick={{ fontSize: 11 }} />
              <Radar 
                name="Skills" 
                dataKey="score" 
                stroke="#6C63FF" 
                fill="#6C63FF" 
                fillOpacity={0.6} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#12122A', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px'
                }} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth & Learning */}
      <div className="chart-row">
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

        <div className="chart-card half">
          <h3>🔥 Top Projects</h3>
          <div className="recent-list">
            {stats?.recentProjects?.slice(0, 5).map((project, index) => (
              <div key={project.id} className="recent-item">
                <div className="recent-number">{index + 1}</div>
                <div className="recent-content">
                  <h4>{project.title}</h4>
                  <div className="project-metrics">
                    <span>⭐ {project.rating_count || 0} ratings</span>
                    <span>👁️ {project.views || 0} views</span>
                  </div>
                </div>
                <div className="recent-score">
                  {project.rating_sum && project.rating_count ? 
                    (project.rating_sum / project.rating_count).toFixed(1) : 0} ★
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Progress */}
      <div className="chart-row">
        <div className="chart-card full">
          <h3>📊 All Skills Progress</h3>
          <div className="skills-progress-grid">
            {skills?.map((skill) => (
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
      </div>
    </div>
  );
};

export default Analytics;
