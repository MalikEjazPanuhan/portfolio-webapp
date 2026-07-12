// F:\portfolio-webapp\frontend\src\components\Admin\CertificatesManager.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaCertificate, FaImage } from 'react-icons/fa';
import './Admin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const CertificatesManager = () => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    credential_url: '',
    image_url: '',
    category: 'Azure',
    featured: false
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload JPEG, PNG, or WebP image');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ FIXED: Correct endpoint and response handling
  const uploadImage = async () => {
    if (!selectedFile) return null;

    const uploadData = new FormData();
    uploadData.append('image', selectedFile); // Must match backend field name

    try {
      const response = await axios.post(`${API_URL}/certificates`, uploadData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Backend returns the full Supabase public URL as 'image_url'
      return response.data.image_url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  // ✅ UPDATED: Handles both new (multipart) and edit (JSON) elegantly
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (editingCert) {
        // For updates: if a new file is selected, upload it first
        let imageUrl = formData.image_url;
        if (selectedFile) {
          const uploadedUrl = await uploadImage();
          if (uploadedUrl) imageUrl = uploadedUrl;
        }

        // Send JSON update (PUT)
        await axios.put(`${API_URL}/certificates/${editingCert.id}`, {
          title: formData.title,
          issuer: formData.issuer || null,
          issue_date: formData.issue_date || null,
          expiry_date: formData.expiry_date || null,
          credential_url: formData.credential_url || null,
          image_url: imageUrl || null,
          category: formData.category || 'Azure',
          featured: formData.featured || false
        }, config);
        toast.success('✅ Certificate updated!');
      } else {
        // For new certificates, send multipart form data directly
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('issuer', formData.issuer || '');
        formDataToSend.append('issue_date', formData.issue_date || '');
        formDataToSend.append('expiry_date', formData.expiry_date || '');
        formDataToSend.append('credential_url', formData.credential_url || '');
        formDataToSend.append('category', formData.category || 'Azure');
        formDataToSend.append('featured', formData.featured ? 'true' : 'false');

        if (selectedFile) {
          formDataToSend.append('image', selectedFile);
        }

        await axios.post(`${API_URL}/certificates`, formDataToSend, {
          ...config,
          headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('✅ Certificate added!');
      }

      setShowModal(false);
      setEditingCert(null);
      setSelectedFile(null);
      setFormData({ title: '', issuer: '', issue_date: '', expiry_date: '', credential_url: '', image_url: '', category: 'Azure', featured: false });
      fetchCertificates();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save certificate');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await axios.delete(`${API_URL}/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Certificate deleted!');
      fetchCertificates();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openEditModal = (cert) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title || '',
      issuer: cert.issuer || '',
      issue_date: cert.issue_date || '',
      expiry_date: cert.expiry_date || '',
      credential_url: cert.credential_url || '',
      image_url: cert.image_url || '',
      category: cert.category || 'Azure',
      featured: cert.featured || false
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="certificates-manager">
      <div className="page-header">
        <div>
          <h1>🏅 Certificates</h1>
          <p>Manage your certifications and achievements</p>
        </div>
        <button className="btn-primary" onClick={() => {
          setEditingCert(null);
          setFormData({ title: '', issuer: '', issue_date: '', expiry_date: '', credential_url: '', image_url: '', category: 'Azure', featured: false });
          setSelectedFile(null);
          setShowModal(true);
        }}>
          <FaPlus /> Add Certificate
        </button>
      </div>

      <div className="certificates-grid">
        {certificates.length === 0 ? (
          <div className="empty-state">
            <p>No certificates yet. Click "Add Certificate" to upload one.</p>
          </div>
        ) : (
          certificates.map(cert => (
            <div key={cert.id} className="certificate-card">
              <div className="certificate-icon">
                {cert.image_url ? (
                  <img 
                    src={cert.image_url} 
                    alt={cert.title} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <FaCertificate style={{ fontSize: '32px', color: '#FFD700' }} />
                )}
              </div>
              <div className="certificate-info">
                <h4>{cert.title}</h4>
                <p>{cert.issuer || 'No issuer'}</p>
                <span className="cert-date">📅 {cert.issue_date || 'No date'}</span>
                {cert.category && <span className="cert-category">{cert.category}</span>}
                {cert.featured && <span className="badge featured">⭐ Featured</span>}
              </div>
              <div className="cert-actions">
                <button className="btn-edit" onClick={() => openEditModal(cert)}>
                  <FaEdit />
                </button>
                <button className="btn-delete" onClick={() => handleDelete(cert.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCert ? 'Edit Certificate' : 'Add Certificate'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
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
                  placeholder="e.g., Azure AI Engineer"
                />
              </div>
              <div className="form-group">
                <label>Issuer</label>
                <input
                  type="text"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleInputChange}
                  placeholder="e.g., Microsoft"
                />
              </div>
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Expiry Date (Optional)</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Azure">Azure</option>
                  <option value="AI">AI</option>
                  <option value="Data">Data</option>
                  <option value="Developer">Developer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Credential URL (Optional)</label>
                <input
                  type="url"
                  name="credential_url"
                  value={formData.credential_url}
                  onChange={handleInputChange}
                  placeholder="https://learn.microsoft.com/..."
                />
              </div>
              
              {/* File Upload */}
              <div className="form-group">
                <label>Upload Certificate Image</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="certificateImage"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="certificateImage" className="file-upload-btn">
                    <FaImage /> Choose File
                  </label>
                  {selectedFile && (
                    <span className="file-name">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                  {formData.image_url && !selectedFile && (
                    <div className="image-preview">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        style={{ maxWidth: '100px', maxHeight: '80px', borderRadius: '8px', marginTop: '8px' }}
                      />
                    </div>
                  )}
                </div>
                <small className="file-hint">Supported: JPEG, PNG, WebP (Max 5MB)</small>
              </div>
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  ⭐ Featured Certificate
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : (editingCert ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesManager;
