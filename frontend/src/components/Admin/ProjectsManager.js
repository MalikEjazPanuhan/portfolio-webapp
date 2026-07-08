// F:\portfolio-webapp\frontend\src\components\Admin\ProjectsManager.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaGithub, FaLink } from 'react-icons/fa';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const ProjectsManager = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    technologies: [],
    live_url: '',
    github_url: '',
    featured: false
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Fetch projects error:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        description: project.description || '',
        category: project.category || '',
        technologies: project.technologies || [],
        live_url: project.live_url || '',
        github_url: project.github_url || '',
        featured: project.featured || false
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        technologies: [],
        live_url: '',
        github_url: '',
        featured: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTechnologiesChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      technologies: value.split(',').map(t => t.trim()).filter(t => t)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await axios.put(`${API_URL}/projects/${editingProject.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Project updated successfully!');
      } else {
        await axios.post(`${API_URL}/projects`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Project created successfully!');
      }
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      console.error('Save project error:', error);
      toast.error(error.response?.data?.error || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Project deleted successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="projects-manager">
      <div className="page-header">
        <div>
          <h1>📁 Projects</h1>
          <p>Manage your portfolio projects</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus /> Add Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Click "Add Project" to get started.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="project-card-admin">
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <div className="project-badges">
                  {project.featured && <span className="badge featured">⭐ Featured</span>}
                  <span className="badge stats">{project.rating_count || 0} ★</span>
                </div>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-tech">
                {project.technologies?.slice(0, 4).map((tech, i) => (
                  <span key={i} className="tech-tag">{tech}</span>
                ))}
                {(project.technologies?.length || 0) > 4 && (
                  <span className="tech-tag">+{project.technologies.length - 4}</span>
                )}
              </div>
              <div className="project-links-admin">
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    <FaLink /> Live
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <FaGithub /> GitHub
                  </a>
                )}
                <span className="project-views">👁️ {project.views || 0} views</span>
              </div>
              <div className="project-actions">
                <button className="btn-edit" onClick={() => handleOpenModal(project)}>
                  <FaEdit /> Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(project.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Project title"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Project description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Web App, AI, Healthcare"
                />
              </div>
              <div className="form-group">
                <label>Technologies (comma separated)</label>
                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies.join(', ')}
                  onChange={handleTechnologiesChange}
                  placeholder="React, Node.js, PostgreSQL"
                />
              </div>
              <div className="form-group">
                <label>Live URL</label>
                <input
                  type="url"
                  name="live_url"
                  value={formData.live_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  Featured Project
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
