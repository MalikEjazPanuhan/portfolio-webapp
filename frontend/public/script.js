// ============================================================
// SCRIPT.JS - COMPLETE PORTFOLIO 360 CV (LIVE API VERSION)
// ============================================================

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL = 'https://portfolio-api-3grn.onrender.com';
const VIDEO_BASE_URL = 'https://portfolio-api-3grn.onrender.com';

// ============================================================
// ANIMATED STAT COUNTERS
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // Animate stats when they come into view
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.dataset.target);
        const duration = 2000;
        const step = Math.max(1, Math.floor(target / (duration / 16)));
        
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = current;
            }
        }, 16);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                if (element.dataset.animated !== 'true') {
                    element.dataset.animated = 'true';
                    animateCounter(element);
                }
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
});

// ============================================================
// UPDATE LAST UPDATED DATE
// ============================================================

function updateLastUpdated() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const options = { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}
updateLastUpdated();

// ============================================================
// ACTIVE NAVIGATION LINK
// ============================================================

const navLinks = document.querySelectorAll('.sidebar-nav ul li a');
const sections = document.querySelectorAll('.section');

function updateActiveLink() {
    let currentSection = '';
    let scrollPosition = window.scrollY + 150;
    
    sections.forEach(section => {
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        }
    });
    
    if (!currentSection && window.scrollY < 100) {
        currentSection = 'profile';
    }
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkTarget = href ? href.replace('#', '') : '';
        const parentLi = link.parentElement;
        
        if (parentLi) {
            if (linkTarget === currentSection) {
                parentLi.classList.add('active');
            } else {
                parentLi.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('load', updateActiveLink);

// ============================================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            navLinks.forEach(link => {
                link.parentElement.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================================
// BACK TO TOP
// ============================================================

const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTop.setAttribute('aria-label', 'Back to top');
document.body.appendChild(backToTop);

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================================
// THEME TOGGLE WITH SYNC
// ============================================================

const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-theme');
        const icon = this.querySelector('i');
        const isLight = document.body.classList.contains('light-theme');
        
        if (isLight) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        
        const theme = isLight ? 'light' : 'dark';
        localStorage.setItem('portfolio-theme', theme);
        localStorage.setItem('admin-theme', theme);
        
        console.log(' Theme saved to localStorage:', theme);
    });
}

// Load saved theme on page load
const savedTheme = localStorage.getItem('portfolio-theme');
console.log('📂 Loaded saved theme:', savedTheme);

if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    const toggleIcon = document.querySelector('.theme-toggle i');
    if (toggleIcon) {
        toggleIcon.className = 'fas fa-sun';
    }
} else {
    document.body.classList.remove('light-theme');
    const toggleIcon = document.querySelector('.theme-toggle i');
    if (toggleIcon) {
        toggleIcon.className = 'fas fa-moon';
    }
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        window.open('https://github.com/MalikEjazPanuhan', '_blank');
    }
    if (e.key === 'k' && !e.ctrlKey && !e.metaKey) {
        window.open('https://www.kaggle.com/malikejazp', '_blank');
    }
    if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        window.open('https://huggingface.co/Malik-2025', '_blank');
    }
});

console.log('🚀 Portfolio 360 - Muhammad Ejaz');
console.log('🔑 Shortcuts: G=GitHub, K=Kaggle, H=Hugging Face');

// ============================================================
// RATING MODAL FUNCTIONS
// ============================================================

let selectedRating = 0;
let currentProjectId = '';

function openRatingModal(projectId, projectName) {
    console.log('🔵 Opening rating modal for:', projectName);
    currentProjectId = projectId;
    selectedRating = 0;
    document.getElementById('ratingProjectName').textContent = projectName;
    document.getElementById('ratingModal').style.display = 'flex';
    document.getElementById('ratingMessage').textContent = '';
    document.getElementById('ratingVisitorName').value = '';
    document.getElementById('ratingComment').value = '';
    
    document.querySelectorAll('.rating-star').forEach(star => {
        star.textContent = '☆';
        star.style.color = 'var(--text-muted)';
    });
}

function closeRatingModal() {
    document.getElementById('ratingModal').style.display = 'none';
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('rating-star')) {
        const value = parseInt(e.target.dataset.value);
        selectedRating = value;
        
        document.querySelectorAll('.rating-star').forEach(s => {
            const starValue = parseInt(s.dataset.value);
            if (starValue <= value) {
                s.textContent = '⭐';
                s.style.color = '#FFD700';
            } else {
                s.textContent = '☆';
                s.style.color = 'var(--text-muted)';
            }
        });
    }
});

async function submitRating() {
    console.log('🔵 Submitting rating...');
    
    if (selectedRating === 0) {
        document.getElementById('ratingMessage').textContent = '⚠️ Please select a star rating!';
        document.getElementById('ratingMessage').style.color = '#FF6B6B';
        return;
    }
    
    const name = document.getElementById('ratingVisitorName').value.trim() || 'Anonymous';
    const comment = document.getElementById('ratingComment').value.trim() || '';
    
    console.log('Rating data:', {
        project_id: currentProjectId,
        rating: selectedRating,
        visitor_name: name,
        comment: comment
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                project_id: currentProjectId,
                rating: selectedRating,
                visitor_name: name,
                comment: comment
            })
        });
        
        const result = await response.json();
        console.log('Response:', result);
        
        if (response.ok) {
            document.getElementById('ratingMessage').textContent = ' Thank you for your rating!';
            document.getElementById('ratingMessage').style.color = '#00C853';
            setTimeout(() => {
                closeRatingModal();
                location.reload();
            }, 1500);
        } else {
            document.getElementById('ratingMessage').textContent = '❌ ' + (result.error || 'Failed to submit rating');
            document.getElementById('ratingMessage').style.color = '#FF6B6B';
        }
    } catch (error) {
        console.error('Network error:', error);
        document.getElementById('ratingMessage').textContent = '❌ Network error. Please try again.';
        document.getElementById('ratingMessage').style.color = '#FF6B6B';
    }
}

// ============================================================
// UTILITY: Get full URL (handles relative and absolute)
// ============================================================
function getFullUrl(url) {
    if (!url) return '';
    // If it's already absolute (starts with http:// or https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Fix malformed 'https//' -> 'https://'
        if (url.startsWith('https//')) {
            return url.replace('https//', 'https://');
        }
        if (url.startsWith('http//')) {
            return url.replace('http//', 'http://');
        }
        return url;
    }
    // Otherwise, prepend base URL
    return API_BASE_URL + url;
}

// ============================================================
// LOAD PROJECTS - FROM LIVE API
// ============================================================

async function loadProjects() {
    try {
        console.log('🔄 Loading projects from API...');
        
        const grid = document.getElementById('projectsGrid');
        if (!grid) {
            console.error('❌ projectsGrid element not found!');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/projects`);
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const projects = await response.json();
        console.log(' Projects loaded:', projects.length);

        if (!projects || projects.length === 0) {
            grid.innerHTML = '<p class="no-projects">No projects yet. Check back soon!</p>';
            return;
        }

        grid.innerHTML = projects.map(p => {
            // Fix video URL and handle YouTube differently if needed
            let videoHtml = '';
            if (p.video_url) {
                const videoSrc = getFullUrl(p.video_url);
                // If it's a YouTube URL, embed an iframe instead of <video>
                if (videoSrc.includes('youtube.com/watch') || videoSrc.includes('youtu.be/')) {
                    // Extract video ID
                    let videoId = '';
                    const match = videoSrc.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/);
                    if (match) videoId = match[1];
                    if (videoId) {
                        videoHtml = `
                            <div style="margin:12px 0;border-radius:8px;overflow:hidden;background:var(--bg-card);position:relative;padding-bottom:56.25%;height:0;">
                                <iframe src="https://www.youtube.com/embed/${videoId}" 
                                    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
                                    allowfullscreen></iframe>
                            </div>
                        `;
                    } else {
                        // Fallback: use <video> tag
                        videoHtml = `
                            <div style="margin:12px 0;border-radius:8px;overflow:hidden;background:var(--bg-card);">
                                <video controls style="width:100%; max-height:200px; background: #0A0A1A; display:block;">
                                    <source src="${videoSrc}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        `;
                    }
                } else {
                    // Normal video file
                    videoHtml = `
                        <div style="margin:12px 0;border-radius:8px;overflow:hidden;background:var(--bg-card);">
                            <video controls style="width:100%; max-height:200px; background: #0A0A1A; display:block;">
                                <source src="${videoSrc}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    `;
                }
            } else {
                videoHtml = `
                    <div style="display:flex;align-items:center;justify-content:center;height:120px;background:var(--bg-card);color:var(--text-muted);flex-direction:column;gap:8px;border:1px dashed var(--border-color);border-radius:8px;margin:12px 0;">
                        <span style="font-size:28px;">🎬</span>
                        <span style="font-size:13px;">Video demo coming soon</span>
                    </div>
                `;
            }

            return `
                <div class="project-item">
                    <div class="project-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <h4 style="margin:0;">${p.title}</h4>
                        <span style="font-size:11px;font-weight:600;padding:2px 12px;background:rgba(0,200,83,0.15);color:#00C853;border-radius:20px;border:1px solid rgba(0,200,83,0.2);">🟢 Live</span>
                    </div>
                    <p style="color:var(--text-secondary);font-size:14px;margin:8px 0;">${p.description}</p>
                    
                    ${videoHtml}
                    
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px;">
                        ${(p.technologies || []).slice(0, 4).map(t => 
                            `<span style="padding:2px 10px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;font-size:11px;color:var(--text-secondary);">${t}</span>`
                        ).join('')}
                    </div>
                    
                    <div style="display:flex;align-items:center;gap:8px;margin:10px 0 12px;padding:8px 12px;background:var(--bg-card);border-radius:8px;border:1px solid var(--border-color);">
                        <span style="color:#FFD700;font-size:14px;letter-spacing:2px;">
                            ${'⭐'.repeat(Math.round(p.avg_rating || 0))}${'☆'.repeat(5 - Math.round(p.avg_rating || 0))}
                        </span>
                        <span style="color:var(--text-muted);font-size:12px;">
                            (${(p.avg_rating || 0).toFixed(1)} · ${p.rating_count || 0} reviews)
                        </span>
                    </div>
                    
                    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                        ${p.live_url ? `<a href="${p.live_url}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:linear-gradient(135deg, #6C63FF, #00D4FF);color:white;text-decoration:none;border-radius:8px;font-size:12px;font-weight:500;">Live Demo</a>` : ''}
                        ${p.github_url ? `<a href="${p.github_url}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:var(--bg-card);color:var(--text-secondary);text-decoration:none;border-radius:8px;font-size:12px;font-weight:500;border:1px solid var(--border-color);">GitHub</a>` : ''}
                        <button onclick="openRatingModal('${p.id}', '${p.title}')" 
                            style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-secondary);font-size:12px;cursor:pointer;transition:all 0.3s ease;">
                            ⭐ Rate
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        console.log('✅ Projects rendered successfully!');
    } catch (error) {
        console.error('❌ Error loading projects:', error);
        const grid = document.getElementById('projectsGrid');
        if (grid) {
            grid.innerHTML = '<p class="no-projects">Failed to load projects. Please try again later.</p>';
        }
    }
}

// ============================================================
// LOAD CERTIFICATES - FROM LIVE API
// ============================================================

async function loadCertificates() {
    try {
        console.log('🔄 Loading certificates from API...');
        
        const grid = document.getElementById('certificatesGrid');
        if (!grid) return;

        const response = await fetch(`${API_BASE_URL}/api/certificates`);
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const certs = await response.json();
        console.log('✅ Certificates loaded:', certs.length);

        if (!certs || certs.length === 0) {
            grid.innerHTML = '<p class="no-certificates">No additional certificates yet.</p>';
            return;
        }

        grid.innerHTML = certs.map(c => {
            const imageSrc = getFullUrl(c.image_url);
            return `
                <div class="certificate-item">
                    ${c.image_url ? `
                        <div class="certificate-image-wrapper">
                            <img src="${imageSrc}" alt="${c.title}" class="certificate-image" loading="lazy" />
                        </div>
                    ` : `
                        <span class="cert-icon">🏅</span>
                    `}
                    <h4>${c.title}</h4>
                    <p>${c.issuer || ''}</p>
                    ${c.issue_date ? `<span class="cert-date">📅 ${c.issue_date}</span>` : ''}
                    ${c.featured ? '<span class="cert-badge">⭐ Featured</span>' : ''}
                    ${c.image_url ? `
                        <button onclick="window.open('${imageSrc}', '_blank')" class="cert-view-btn">
                            👁️ View Certificate
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        console.log('✅ Certificates rendered successfully!');
    } catch (error) {
        console.error('❌ Error loading certificates:', error);
        const grid = document.getElementById('certificatesGrid');
        if (grid) {
            grid.innerHTML = '<p class="no-certificates">Failed to load certificates. Please try again later.</p>';
        }
    }
}

// ============================================================
// LOAD ON PAGE LOAD
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    loadCertificates();
});
