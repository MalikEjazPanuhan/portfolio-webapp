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
    <div className="portfolio-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <aside className="sidebar" style={{ width: '250px', flexShrink: 0, padding: '20px' }}>
        <div className="sidebar-header">
          <h2>Portfolio 360</h2>
          <span className="subtitle">DEVELOPER HUB</span>
        </div>
        
        <nav className="nav-menu" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
          <a href="#hero" className="nav-item">
            <i className="fas fa-user"></i> Profile
          </a>
          <a href="#projects" className="nav-item">
            <i className="fas fa-code"></i> Projects
          </a>
          <a href="#certifications" className="nav-item">
            <i className="fas fa-certificate"></i> Certifications
          </a>
          <a href="/login" className="nav-item admin-link" style={{ marginTop: '20px', color: '#61dafb' }}>
            <i className="fas fa-lock"></i> Go to Admin Dashboard
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ flexGrow: 1, padding: '40px' }}>
        {/* Hero Section */}
        <header id="hero" className="hero-section">
          <h1>Muhammad Ejaz</h1>
          <p className="hero-title">Developer Hub & AI Solutions</p>
          <a href="/login" className="cta-button" style={{ display: 'inline-block', marginTop: '15px' }}>
            <i className="fas fa-rocket"></i> Go to Admin Dashboard <i className="fas fa-arrow-right"></i>
          </a>
        </header>

        {/* Projects Section */}
        <section id="projects" className="section-container" style={{ marginTop: '50px' }}>
          <div className="section-header">
            <h2>Projects</h2>
            <p>End-to-end AI solutions and applications I've built.</p>
          </div>
          
          {loading ? (
            <p>Loading projects...</p>
          ) : (
            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {projects.map((proj, idx) => (
                <div key={proj._id || idx} className="project-card" style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
                  <h3>{proj.title || proj.name}</h3>
                  <p>{proj.description}</p>
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
        <section id="certifications" className="section-container" style={{ marginTop: '50px' }}>
          <div className="section-header">
            <h2>Certifications</h2>
          </div>
          
          {loading ? (
            <p>Loading certificates...</p>
          ) : (
            <div className="certifications-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {certificates.map((cert, idx) => (
                <div key={cert._id || idx} className="cert-card" style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
                  <i className="fas fa-award" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                  <h3>{cert.title}</h3>
                  <p>{cert.issuer}</p>
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
