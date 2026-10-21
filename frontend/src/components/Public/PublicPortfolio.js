import React, { useEffect, useState } from 'react';
// Import your CSS styles for the portfolio if available, or load them
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
        const projData = await projRes.json();
        setProjects(projData);

        // Fetch Certificates
        const certRes = await fetch(`${backendUrl}/certificates`);
        const certData = await certRes.json();
        setCertificates(certData);
      } catch (err) {
        console.error("Error fetching public data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  return (
    <div>
      {/* Navigation / Header */}
      <nav className="navbar">
        <div className="nav-brand">Portfolio 360</div>
        <div className="nav-links">
          <a href="#projects">Projects</a>
          <a href="#certifications">Certifications</a>
          <a href="/login" className="admin-btn">Go to Admin Dashboard</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Muhammad Ejaz</h1>
        <p>Developer Hub & AI Solutions</p>
        <a href="/login" className="cta-button">
          <i className="fas fa-rocket"></i> Go to Admin Dashboard
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
              <div key={idx} className="card">
                <h3>{proj.title || proj.name}</h3>
                <p>{proj.description}</p>
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
              <div key={idx} className="card">
                <h3>{cert.title}</h3>
                <p>{cert.issuer}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicPortfolio;
