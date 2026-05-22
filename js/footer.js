/**
 * FULL ENCARGOS - Footer Interactivo
 */
class FooterManager {
    constructor() {
        this.newsletterForm = document.getElementById('newsletterForm');
        this.init();
    }
    
    init() {
        if (this.newsletterForm) {
            this.newsletterForm.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
        }
    }
    
    handleNewsletterSubmit(event) {
        event.preventDefault();
        
        const emailInput = this.newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, ingresa un correo válido', 'error');
            return;
        }
        
        // Simular envío (aquí conectarías con tu backend)
        this.showMessage('✅ ¡Gracias por suscribirte! Revisa tu correo.', 'success');
        emailInput.value = '';
        
        // Guardar en localStorage
        this.saveSubscriber(email);
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    showMessage(message, type) {
        // Crear elemento de mensaje
        const messageEl = document.createElement('div');
        messageEl.className = `newsletter-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            padding: 12px;
            margin-top: 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            animation: fadeInUp 0.3s ease;
            ${type === 'success' 
                ? 'background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2);' 
                : 'background: rgba(230, 0, 11, 0.1); color: #E6000B; border: 1px solid rgba(230, 0, 11, 0.2);'}
        `;
        
        // Remover mensaje anterior
        const existingMessage = this.newsletterForm.querySelector('.newsletter-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        this.newsletterForm.appendChild(messageEl);
        
        // Auto remover después de 5 segundos
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 5000);
    }
    
    saveSubscriber(email) {
        try {
            const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('subscribers', JSON.stringify(subscribers));
            }
        } catch (error) {
            console.warn('No se pudo guardar el suscriptor');
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.footerManager = new FooterManager();
});