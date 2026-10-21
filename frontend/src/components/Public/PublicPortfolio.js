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
    <div className="portfolio-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Portfolio 360</h2>
          <span className="subtitle">DEVELOPER HUB</span>
        </div>
        <nav className="nav-menu">
          <a href="#hero" className="nav-item active"><i className="fas fa-user"></i> Profile</a>
          <a href="#projects" className="nav-item"><i className="fas fa-code"></i> Projects</a>
          <a href="#certifications" className="nav-item"><i className="fas fa-certificate"></i> Certifications</a>
          <a href="/login" className="nav-item admin-link"><i className="fas fa-lock"></i> Go to Admin Dashboard</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Hero Section */}
        <header id="hero" className="hero-section">
          <h1>Muhammad Ejaz</h1>
          <p className="hero-title">Developer Hub & AI Solutions</p>
          <a href="/login" className="cta-button">
            <i className="fas fa-rocket"></i> Go to Admin Dashboard <i className="fas fa-arrow-right"></i>
          </a>
        </header>

        {/* Projects Section */}
        <section id="projects" className="section-container">
          <div className="section-header">
            <h2>Projects</h2>
            <p>End-to-end AI solutions and applications I've built.</p>
          </div>
          
          {loading ? (
            <div className="loading-spinner">Loading projects...</div>
          ) : (
            <div className="projects-grid">
              {projects.map((proj, idx) => (
                <div key={proj._id || idx} className="project-card">
                  <div className="card-header">
                    <h3>{proj.title || proj.name}</h3>
                  </div>
                  <p className="card-description">{proj.description}</p>
                  {proj.techStack && (
                    <div className="tech-tags">
                      {Array.isArray(proj.techStack) ? proj.techStack.map((tech, i) => (
                        <span key={i} className="tech-tag">{tech}</span>
                      )) : <span className="tech-tag">{proj.techStack}</span>}
                    </div>
                  )}
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link">
                      View Project <i className="fas fa-external-link-alt"></i>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="section-container">
          <div className="section-header">
            <h2>Certifications</h2>
          </div>
          
          {loading ? (
            <div className="loading-spinner">Loading certificates...</div>
          ) : (
            <div className="certifications-grid">
              {certificates.map((cert, idx) => (
                <div key={cert._id || idx} className="cert-card">
                  <div className="cert-icon"><i className="fas fa-award"></i></div>
                  <div className="cert-info">
                    <h3>{cert.title}</h3>
                    <p className="cert-issuer">{cert.issuer}</p>
                    {cert.issueDate && <span className="cert-date">{cert.issueDate}</span>}
                  </div>
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
