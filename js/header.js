/**
 * FULL ENCARGOS - Sistema de Navegación del Header
 * Control del menú responsive y accesibilidad
 */
class HeaderNavigation {
    constructor() {
        // Elementos del DOM
        this.mobileToggle = document.getElementById('mobileToggle');
        this.navNavigation = document.getElementById('navNavigation');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.allNavItems = document.querySelectorAll('.nav-link, .nav-btn');
        
        // Estado
        this.isMenuOpen = false;
        this.isTransitioning = false;
        this.currentSection = null;
        this.scrollPosition = null;
        this.scrollTimeout = null;
        
        // Configuración
        this.config = {
            mobileBreakpoint: 992,
            scrollOffset: 80,
            scrollDuration: 800,
            transitionDelay: 300,
            activeLinkOffset: 100
        };
        
        // Binding de métodos
        this.toggleMenu = this.toggleMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
        
        // Inicializar
        this.init();
    }
    
    init() {
        if (!this.mobileToggle || !this.navNavigation) {
            console.warn('HeaderNavigation: Elementos no encontrados');
            return;
        }
        
        this.createOverlay();
        this.setupEventListeners();
        this.detectActiveSection();
    }
    
    createOverlay() {
        this.navOverlay = document.querySelector('.nav-overlay');
        if (!this.navOverlay) {
            this.navOverlay = document.createElement('div');
            this.navOverlay.className = 'nav-overlay';
            this.navOverlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(this.navOverlay);
        }
    }
    
    setupEventListeners() {
        this.mobileToggle.addEventListener('click', this.toggleMenu);
        this.navOverlay.addEventListener('click', this.closeMenu);
        document.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('resize', this.debounce(this.handleResize, 150));
        window.addEventListener('scroll', this.debounce(this.handleScroll, 100), { passive: true });
        
        this.allNavItems.forEach(item => {
            item.addEventListener('click', this.handleLinkClick);
        });
    }
    
    toggleMenu(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.isMenuOpen = !this.isMenuOpen;
        
        this.mobileToggle.setAttribute('aria-expanded', this.isMenuOpen);
        this.navOverlay.setAttribute('aria-hidden', !this.isMenuOpen);
        
        requestAnimationFrame(() => {
            this.navNavigation.classList.toggle('active', this.isMenuOpen);
            this.navOverlay.classList.toggle('active', this.isMenuOpen);
            
            if (this.isMenuOpen) {
                this.lockScroll();
                this.focusFirstMenuItem();
            } else {
                this.unlockScroll();
                this.mobileToggle.focus();
            }
            
            setTimeout(() => {
                this.isTransitioning = false;
            }, this.config.transitionDelay);
        });
    }
    
    closeMenu(event) {
        if (event) event.preventDefault();
        if (!this.isMenuOpen) return;
        
        this.isMenuOpen = false;
        this.isTransitioning = true;
        
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        this.navOverlay.setAttribute('aria-hidden', 'true');
        this.navNavigation.classList.remove('active');
        this.navOverlay.classList.remove('active');
        
        this.unlockScroll();
        this.mobileToggle.focus();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.config.transitionDelay);
    }
    
    handleLinkClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        this.setActiveLink(link);
        
        if (href && href.startsWith('#') && href !== '#') {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                event.preventDefault();
                this.smoothScrollTo(targetElement);
                
                if (this.isMenuOpen && window.innerWidth <= this.config.mobileBreakpoint) {
                    this.closeMenu();
                }
                
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        } else if (window.innerWidth <= this.config.mobileBreakpoint) {
            this.closeMenu();
        }
    }
    
    smoothScrollTo(targetElement) {
        const startPosition = window.pageYOffset;
        const targetPosition = targetElement.getBoundingClientRect().top + startPosition - this.config.scrollOffset;
        const distance = targetPosition - startPosition;
        const duration = this.config.scrollDuration;
        let startTime = null;
        
        const animation = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
    
    setActiveLink(activeLink) {
        this.allNavItems.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        });
        
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }
    }
    
    detectActiveSection() {
        const sections = [];
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const section = document.getElementById(href.substring(1));
                if (section) {
                    sections.push({ link, section });
                }
            }
        });
        
        if (sections.length === 0) return;
        
        const scrollPosition = window.scrollY + this.config.activeLinkOffset + this.config.scrollOffset;
        let activeSection = sections[0];
        
        sections.forEach(({ link, section }) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                activeSection = { link, section };
            }
        });
        
        if (activeSection && this.currentSection !== activeSection.section) {
            this.currentSection = activeSection.section;
            this.setActiveLink(activeSection.link);
        }
    }
    
    handleScroll() {
        if (this.scrollTimeout) {
            window.cancelAnimationFrame(this.scrollTimeout);
        }
        
        this.scrollTimeout = window.requestAnimationFrame(() => {
            this.detectActiveSection();
            
            const header = document.querySelector('.main-header');
            if (header) {
                if (window.scrollY > 10) {
                    header.classList.add('header-scrolled');
                } else {
                    header.classList.remove('header-scrolled');
                }
            }
        });
    }
    
    handleKeydown(event) {
        if (event.key === 'Escape' && this.isMenuOpen) {
            event.preventDefault();
            this.closeMenu();
            return;
        }
        
        if (this.isMenuOpen && event.key === 'Tab') {
            this.trapFocus(event);
        }
    }
    
    trapFocus(event) {
        const focusableElements = this.navNavigation.querySelectorAll(
            'a[href], button:not([disabled])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    }
    
    focusFirstMenuItem() {
        setTimeout(() => {
            const firstLink = this.navNavigation.querySelector('.nav-link, .nav-btn');
            if (firstLink) firstLink.focus();
        }, this.config.transitionDelay);
    }
    
    handleResize() {
        if (window.innerWidth > this.config.mobileBreakpoint && this.isMenuOpen) {
            this.closeMenu();
        }
    }
    
    lockScroll() {
        this.scrollPosition = window.pageYOffset;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.scrollPosition}px`;
        document.body.style.width = '100%';
    }
    
    unlockScroll() {
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('width');
        
        if (this.scrollPosition !== null) {
            window.scrollTo(0, this.scrollPosition);
            this.scrollPosition = null;
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.headerNav = new HeaderNavigation();
});