// F:\portfolio-webapp\frontend\src\components\Admin\VideosManager.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaVideo, FaPlay, FaUpload, FaDownload } from 'react-icons/fa';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const VideosManager = () => {
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    category: 'demo'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [videosRes, projectsRes] = await Promise.all([
        axios.get(`${API_URL}/videos`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setVideos(videosRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload MP4, WebM, OGG, or MOV video');
        e.target.value = '';
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video must be less than 100MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('project_id', formData.project_id);
    uploadData.append('category', formData.category);
    uploadData.append('video', selectedFile);

    try {
      await axios.post(`${API_URL}/videos`, uploadData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('✅ Video uploaded successfully!');
      setShowUpload(false);
      setFormData({ title: '', description: '', project_id: '', category: 'demo' });
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  // ============ IMPORT FROM URL ============
  const handleImportFromUrl = async () => {
    if (!importUrl) {
      toast.error('Please enter a video URL');
      return;
    }

    setImporting(true);
    try {
      const response = await axios.post(`${API_URL}/import/video`, {
        url: importUrl,
        title: formData.title || 'Imported Video',
        description: formData.description || '',
        category: formData.category || 'demo',
        project_id: formData.project_id || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('✅ Video imported successfully!');
      setImportUrl('');
      setFormData({ title: '', description: '', project_id: '', category: 'demo' });
      setShowUpload(false);
      fetchData();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.error || 'Failed to import video');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await axios.delete(`${API_URL}/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Video deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete video');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="videos-manager">
      <div className="page-header">
        <div>
          <h1>🎬 Video Management</h1>
          <p>Upload and manage demo videos for your projects</p>
        </div>
        <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel' : <><FaPlus /> Upload Video</>}
        </button>
      </div>

      {showUpload && (
        <div className="upload-container">
          <h3>📤 Upload New Video</h3>
          <form onSubmit={handleUpload} className="upload-form">
            
            <div className="form-group">
              <label>Video Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Lead Rescue 360 Demo"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the video"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Project (Optional)</label>
              <select name="project_id" value={formData.project_id} onChange={handleInputChange}>
                <option value="">None (Standalone)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="demo">🎬 Demo</option>
                <option value="tutorial">📚 Tutorial</option>
                <option value="presentation">📊 Presentation</option>
                <option value="other">📁 Other</option>
              </select>
            </div>

            {/* ========== IMPORT FROM URL ========== */}
            <div className="import-section">
              <div className="divider-text">📥 Import from URL</div>
              
              <div className="form-group">
                <label>Facebook or YouTube URL</label>
                <div className="import-input-group">
                  <input
                    type="url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://www.facebook.com/.../videos/... or https://www.youtube.com/watch?v=..."
                    disabled={importing}
                    className="import-url-input"
                  />
                  <button 
                    onClick={handleImportFromUrl} 
                    className="btn-import"
                    disabled={importing || !importUrl}
                  >
                    {importing ? '⏳ Importing...' : '🎬 Import'}
                  </button>
                </div>
                <small className="import-help">
                  Paste a Facebook or YouTube video URL. The video will be downloaded automatically.
                </small>
              </div>

              <div className="divider-text">─ OR ─</div>
            </div>

            {/* ========== FILE UPLOAD ========== */}
            <div className="form-group">
              <label>Upload Video File (MP4, WebM, OGG - Max 100MB)</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <span className="file-name">
                    <FaVideo /> {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="upload-btn" disabled={uploading}>
                {uploading ? '⏳ Uploading...' : '📤 Upload Video'}
              </button>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="videos-grid">
        {videos.length === 0 ? (
          <div className="empty-state">
            <p>No videos uploaded yet. Click "Upload Video" to add one.</p>
          </div>
        ) : (
          videos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail">
                <video 
                  controls 
                  src={video.path}

                  style={{ 
                    width: '100%', 
                    height: '160px', 
                    objectFit: 'cover',
                    background: '#0A0A1A'
                  }}
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%2312122A'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236A6A8A' font-size='14' font-family='Arial'%3E🎬%3C/text%3E%3C/svg%3E"
                  onLoadedMetadata={(e) => {
                    // Update duration when video metadata loads
                    const duration = e.target.duration;
                    if (duration && duration > 0) {
                      const mins = Math.floor(duration / 60);
                      const secs = Math.floor(duration % 60);
                      const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                      const durationElement = e.target.closest('.video-thumbnail').querySelector('.video-duration');
                      if (durationElement) {
                        durationElement.textContent = durationStr;
                      }
                    }
                  }}
                />
                <div className="video-duration">00:00</div>
              </div>
              <div className="video-info">
                <h4>{video.title}</h4>
                <p>{video.description}</p>
                <div className="video-meta">
                  <span className="video-project">
                    {video.projects?.title || 'No project'}
                  </span>
                  <span className="video-category">{video.category || 'demo'}</span>
                  <span className="video-views">👁️ {video.views || 0} views</span>
                </div>
                <div className="video-actions">
                  <button className="btn-delete" onClick={() => handleDelete(video.id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideosManager;
