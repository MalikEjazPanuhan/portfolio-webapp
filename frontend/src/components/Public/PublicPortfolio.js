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
        
        const projRes = await fetch(`${backendUrl}/projects`);
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData);
        }

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
        <div className="profile-header">
          <h2>Portfolio 360</h2>
          <p className="subtitle">DEVELOPER HUB</p>
        </div>
        
        <ul className="nav-links">
          <li><a href="#profile"><i className="fas fa-user"></i> Profile</a></li>
          <li><a href="#portfolio"><i className="fas fa-briefcase"></i> Portfolio</a></li>
          <li><a href="#projects" className="active"><i className="fas fa-code"></i> Projects</a></li>
          <li><a href="#github"><i className="fab fa-github"></i> GitHub</a></li>
          <li><a href="#huggingface"><i className="fas fa-robot"></i> Hugging Face</a></li>
          <li><a href="#tools"><i className="fas fa-tools"></i> Tools</a></li>
          <li><a href="#certifications"><i className="fas fa-certificate"></i> Certifications</a></li>
          <li><a href="#azure"><i className="fab fa-microsoft"></i> Microsoft Azure</a></li>
          <li><a href="#python"><i className="fab fa-python"></i> Python</a></li>
          <li><a href="#frameworks"><i className="fas fa-layer-group"></i> Frameworks</a></li>
          <li><a href="#libraries"><i className="fas fa-book"></i> Libraries</a></li>
          <li><a href="#n8n"><i className="fas fa-network-wired"></i> N8N</a></li>
          <li><a href="#kaggle"><i className="fab fa-kaggle"></i> Kaggle</a></li>
        </ul>

        <div className="sidebar-footer" style={{ padding: '20px' }}>
          <a href="/login" className="cta-button" style={{ fontSize: '13px', padding: '10px 15px', textAlign: 'center', display: 'block' }}>
            <i className="fas fa-lock"></i> Go to Admin Dashboard
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header id="profile" className="hero">
          <h1>Muhammad Ejaz</h1>
          <p>Developer Hub & AI Solutions</p>
          <a href="/login" className="cta-button">
            <i className="fas fa-rocket"></i> Go to Admin Dashboard <i className="fas fa-arrow-right"></i>
          </a>
        </header>

        {/* Projects Section */}
        <section id="projects" className="section">
          <h2>Projects</h2>
          <p>End-to-end AI solutions and applications I've built.</p>
          
          {loading ? (
            <p>Loading projects...</p>
          ) : (
            <div className="grid">
              {projects.map((proj, idx) => (
                <div key={proj._id || idx} className="card">
                  <h3>{proj.title || proj.name}</h3>
                  <p>{proj.description}</p>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="btn" style={{ marginTop: '10px', display: 'inline-block' }}>
                      Live Demo <i className="fas fa-external-link-alt"></i>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="section">
          <h2>Certifications</h2>
          
          {loading ? (
            <p>Loading certificates...</p>
          ) : (
            <div className="grid">
              {certificates.map((cert, idx) => (
                <div key={cert._id || idx} className="card">
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
