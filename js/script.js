// Dynamic Content Rendering & Interactive Logic
document.addEventListener('DOMContentLoaded', () => {
    if (typeof siteConfig === 'undefined') return;

    // 1. Core Content Hydration (text, attributes, meta)
    hydrateContent();

    // 2. Dynamic Component Renderers
    renderNavigation();
    renderStats();
    renderPrograms();
    renderTestimonials();

    // 3. Initialize Lucide Icons (Done after dynamic items are inserted)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 4. Mobile Navigation Menu Toggle
    initMobileMenu();

    // 5. Scroll Animations (Intersection Observer)
    initScrollAnimations();

    // 6. Trial Class Booking Modal Logic
    initTrialModal();
});

// Helper to hydrate basic metadata and content matching data-content/data-href attributes
function hydrateContent() {
    // Content replacements (Text, Meta, Source, Iframe)
    document.querySelectorAll('[data-content]').forEach(el => {
        const path = el.getAttribute('data-content').split('.');
        let val = siteConfig;
        for (let key of path) {
            if (val) val = val[key];
        }
        
        if (val !== undefined) {
            if (el.tagName === 'META') {
                el.setAttribute('content', val);
            } else if (el.tagName === 'IMG' || el.tagName === 'IFRAME') {
                el.src = val;
            } else if (el.tagName === 'TITLE') {
                document.title = val;
            } else {
                el.innerHTML = val;
            }
        }
    });

    // Href link replacements
    document.querySelectorAll('[data-href]').forEach(el => {
        const path = el.getAttribute('data-href').split('.');
        let val = siteConfig;
        for (let key of path) {
            if (val) val = val[key];
        }
        if (val) el.href = val;
    });
}

// Dynamically render the navigation links
function renderNavigation() {
    const linksContainer = document.getElementById('navLinksContainer');
    const footerContainer = document.getElementById('footerLinksContainer');
    
    if (linksContainer && siteConfig.nav && siteConfig.nav.links) {
        linksContainer.innerHTML = '';
        siteConfig.nav.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.label;
            a.className = 'nav-link';
            linksContainer.appendChild(a);
        });
    }

    if (footerContainer && siteConfig.nav && siteConfig.nav.links) {
        footerContainer.innerHTML = '';
        siteConfig.nav.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.label;
            a.className = 'footer-link';
            footerContainer.appendChild(a);
        });
    }

    // Sticky Navbar behavior
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                const navMenu = document.getElementById('navMenu');
                const menuToggle = document.getElementById('menuToggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (menuToggle) {
                        menuToggle.innerHTML = '<i data-lucide="menu"></i>';
                        lucide.createIcons();
                    }
                }

                const offset = 80; // Offset for sticky header
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Dynamically render stats grid
function renderStats() {
    const grid = document.getElementById('statsGrid');
    if (!grid || !siteConfig.stats) return;

    grid.innerHTML = '';
    siteConfig.stats.forEach((stat, index) => {
        const card = document.createElement('div');
        card.className = `stats-card glass-card fade-in-up delay-${(index % 3) + 1}`;
        card.innerHTML = `
            <div class="stat-icon-wrapper">
                <i data-lucide="${stat.icon}"></i>
            </div>
            <div class="stat-info">
                <h3>${stat.value}</h3>
                <p>${stat.label}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Dynamically render program cards
function renderPrograms() {
    const grid = document.getElementById('programsGrid');
    if (!grid || !siteConfig.modalidades || !siteConfig.modalidades.cards) return;

    grid.innerHTML = '';
    siteConfig.modalidades.cards.forEach((card, index) => {
        const delayClass = `delay-${(index % 3) + 1}`;
        const item = document.createElement('div');
        item.className = `program-card glass-card hover-lift fade-in-up ${delayClass}`;
        
        item.innerHTML = `
            <div class="program-header">
                <div class="program-icon-box">
                    <i data-lucide="${card.icon}"></i>
                </div>
                ${card.badge ? `<span class="program-badge">${card.badge}</span>` : ''}
            </div>
            <div class="program-body">
                <h3>${card.title}</h3>
                <p class="program-desc">${card.description}</p>
            </div>
            <div class="program-footer">
                <span class="program-age">
                    <i data-lucide="user"></i>
                    <span>${card.age}</span>
                </span>
                <button class="btn btn-text btn-schedule-trial-modal" data-modalidade="${card.title}">
                    <span>Falar com a Equpe</span>
                    <i data-lucide="chevron-right"></i>
                </button>
            </div>
        `;
        grid.appendChild(item);
    });
}

// Dynamically render testimonials
function renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid || !siteConfig.testimonials || !siteConfig.testimonials.list) return;

    grid.innerHTML = '';
    
    // Duplicate the list of testimonials to create a seamless infinite loop in CSS
    const listToRender = [...siteConfig.testimonials.list, ...siteConfig.testimonials.list];
    
    listToRender.forEach((test, index) => {
        const item = document.createElement('div');
        item.className = 'testimonial-card glass-card';
        
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += `<i data-lucide="star" class="${i < test.rating ? 'star-filled' : 'star-empty'}"></i>`;
        }

        item.innerHTML = `
            <div class="testimonial-rating">
                ${stars}
            </div>
            <p class="testimonial-text">"${test.comment}"</p>
            <div class="testimonial-author">
                <div class="author-details">
                    <strong>${test.name}</strong>
                    <span>${test.role}</span>
                </div>
            </div>
        `;
        grid.appendChild(item);
    });
}

// Mobile navigation menu trigger
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            menuToggle.innerHTML = isActive ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }
}

// Scroll animation intersection observer
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Dynamic classes query selectors
    setTimeout(() => {
        document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach((el) => {
            observer.observe(el);
        });
    }, 200);
}

// Booking Trial Class Modal
function initTrialModal() {
    const modal = document.getElementById('trialModal');
    const closeBtn = document.getElementById('modalClose');
    const form = document.getElementById('trialForm');
    const programSelect = document.getElementById('selectedProgram');

    if (!modal) return;

    // Show modal trigger listeners
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.btn-schedule-trial-modal');
        if (trigger) {
            e.preventDefault();
            
            // Auto-select program if button is inside a specific program card
            const preselected = trigger.getAttribute('data-modalidade');
            if (preselected && programSelect) {
                for (let option of programSelect.options) {
                    if (option.value.toLowerCase() === preselected.toLowerCase()) {
                        option.selected = true;
                        break;
                    }
                }
            } else if (programSelect) {
                programSelect.selectedIndex = 0;
            }

            // Open modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        }
    });

    // Close modal triggers
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const studentName = document.getElementById('studentName').value.trim();
            const studentAge = document.getElementById('studentAge').value.trim();
            const selectedProgram = programSelect.value;
            const parentWhatsApp = document.getElementById('parentWhatsApp').value.trim();
            
            // Build the WhatsApp message
            const message = `Olá! Gostaria de agendar uma aula experimental grátis na Academia Mariana Casseb.%0A%0A` +
                            `*DADOS DO AGENDAMENTO:*%0A` +
                            `• *Nome do Aluno(a):* ${encodeURIComponent(studentName)}%0A` +
                            `• *Idade:* ${encodeURIComponent(studentAge)}%0A` +
                            `• *Modalidade:* ${encodeURIComponent(selectedProgram)}%0A` +
                            `• *WhatsApp de Contato:* ${encodeURIComponent(parentWhatsApp)}`;
            
            // Get base phone link from siteConfig or use default phone
            const phoneNum = '5519991995884'; // Mariana Casseb WhatsApp
            const waUrl = `https://wa.me/${phoneNum}?text=${message}`;
            
            // Open WhatsApp redirect tab
            window.open(waUrl, '_blank');
            
            // Reset form and close
            form.reset();
            closeModal();
        });
    }
}
