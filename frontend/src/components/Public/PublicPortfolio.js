import React, { useEffect, useState } from 'react';
import '../../style.css'; 

const PublicPortfolio = () => {
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const backendUrl = "https://portfolio-api-3grn.onrender.com/api";
        
        // Fetch Projects
        const projRes = await fetch(`${backendUrl}/projects`);
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData);
        }

        // Fetch Certificates
        const certRes = await fetch(`${backendUrl}/certificates`);
        if (certRes.ok) {
          const certData = await certRes.json();
          setCertificates(certData);
        }
      } catch (err) {
        console.error("Error fetching public data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  return (
    <div className="container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <h2>Portfolio 360</h2>
          <p className="developer-hub">DEVELOPER HUB</p>
        </div>
        
        <nav className="nav-links">
          <a href="#profile" className="nav-link"><i className="fas fa-user"></i> Profile</a>
          <a href="#portfolio" className="nav-link"><i className="fas fa-briefcase"></i> Portfolio</a>
          <a href="#projects" className="nav-link active"><i className="fas fa-code"></i> Projects</a>
          <a href="#github" className="nav-link"><i className="fab fa-github"></i> GitHub</a>
          <a href="#huggingface" className="nav-link"><i className="fas fa-robot"></i> Hugging Face</a>
          <a href="#tools" className="nav-link"><i className="fas fa-tools"></i> Tools</a>
          <a href="#certifications" className="nav-link"><i className="fas fa-certificate"></i> Certifications</a>
          <a href="#azure" className="nav-link"><i className="fab fa-microsoft"></i> Microsoft Azure</a>
          <a href="#python" className="nav-link"><i className="fab fa-python"></i> Python</a>
          <a href="#frameworks" className="nav-link"><i className="fas fa-layer-group"></i> Frameworks</a>
          <a href="#libraries" className="nav-link"><i className="fas fa-book"></i> Libraries</a>
          <a href="#n8n" className="nav-link"><i className="fas fa-network-wired"></i> N8N</a>
          <a href="#kaggl" className="nav-link"><i className="fab fa-kaggle"></i> Kaggle</a>
          
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <a href="/login" className="nav-link" style={{ color: '#61dafb' }}>
              <i className="fas fa-lock"></i> Go to Admin Dashboard
            </a>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="content">
        {/* Top Header / Theme Toggle */}
        <div className="top-bar">
          <button id="theme-toggle" className="theme-toggle-btn" onClick={() => document.body.classList.toggle('light-theme')}>
            <i className="fas fa-moon"></i>
          </button>
        </div>

        {/* Hero / Profile Section */}
        <section id="profile" className="hero-section">
          <h1>Muhammad Ejaz</h1>
          <p className="hero-subtitle">Developer Hub & AI Solutions</p>
          <a href="/login" className="cta-button">
            <i className="fas fa-rocket"></i> Go to Admin Dashboard <i className="fas fa-arrow-right"></i>
          </a>
        </section>

        {/* Projects Section */}
        <section id="projects" className="section">
          <div className="section-title-container">
            <h2><i className="fas fa-folder-open"></i> Projects</h2>
          </div>
          <p className="section-desc">End-to-end AI solutions and applications I've built.</p>
          
          {loading ? (
            <p className="loading-text">Loading projects...</p>
          ) : (
            <div className="grid">
              {projects.map((proj, idx) => (
                <div key={proj._id || idx} className="card">
                  <div className="card-top">
                    <h3>{proj.title || proj.name}</h3>
                    <span className="badge-live"><i className="fas fa-circle"></i> Live</span>
                  </div>
                  <p className="card-sub">{proj.description}</p>
                  
                  {proj.videoUrl && (
                    <div className="video-container">
                      <iframe src={proj.videoUrl} title={proj.title} allowFullScreen></iframe>
                    </div>
                  )}

                  {proj.techStack && (
                    <div className="tags">
                      {Array.isArray(proj.techStack) ? proj.techStack.map((tech, i) => (
                        <span key={i} className="tag">{tech}</span>
                      )) : <span className="tag">{proj.techStack}</span>}
                    </div>
                  )}

                  <div className="card-footer-actions">
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        Live Demo
                      </a>
                    )}
                    {proj.github && (
                      <a href={proj.github} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="section">
          <div className="section-title-container">
            <h2><i className="fas fa-certificate"></i> Certifications</h2>
          </div>
          
          {loading ? (
            <p className="loading-text">Loading certificates...</p>
          ) : (
            <div className="grid">
              {certificates.map((cert, idx) => (
                <div key={cert._id || idx} className="card">
                  <h3>{cert.title}</h3>
                  <p className="card-sub">{cert.issuer}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PublicPortfolio;
