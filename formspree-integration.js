/**
 * Formspree Integration Handler
 * Handles form submissions for contact and newsletter forms
 */

// Formspree Configuration
const FORMSPREE_CONFIG = {
    projectId: '2901802241138621618',
    deployKey: '4044d470f6b64579adc57322e34c626a',
    // Form IDs - Update these with your actual Formspree form IDs
    // Create forms at: https://formspree.io/forms
    endpoints: {
        contact: 'https://formspree.io/f/xpzgkqwn', // TODO: Replace with your contact form ID
        newsletter: 'https://formspree.io/f/xpzgkqwn' // TODO: Replace with your newsletter form ID
    }
};

/**
 * Handle Contact Form Submission
 */
async function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours...';
    
    try {
        const response = await fetch(FORMSPREE_CONFIG.endpoints.contact, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Success
            showFormMessage(form, 'Merci ! Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.', 'success');
            form.reset();
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Une erreur est survenue');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showFormMessage(form, 'Désolé, une erreur est survenue lors de l\'envoi. Veuillez réessayer ou nous contacter directement.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

/**
 * Handle Newsletter Form Submission
 */
async function handleNewsletterForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    const messageEl = document.getElementById('newsletterMessage');
    
    if (!email) {
        showNewsletterMessage(messageEl, 'Veuillez entrer une adresse email valide.', 'error');
        return;
    }
    
    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Inscription...';
    
    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('_subject', 'Nouvelle inscription newsletter - AZZ&CO LABS');
        formData.append('_format', 'plain');
        
        const response = await fetch(FORMSPREE_CONFIG.endpoints.newsletter, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Success
            showNewsletterMessage(messageEl, 'Merci ! Vous êtes maintenant inscrit à notre newsletter.', 'success');
            form.reset();
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Une erreur est survenue');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showNewsletterMessage(messageEl, 'Désolé, une erreur est survenue. Veuillez réessayer.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

/**
 * Show form message
 */
function showFormMessage(form, message, type) {
    // Remove existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = 'form-message';
    messageEl.style.cssText = `
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        ${type === 'success' 
            ? 'background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);' 
            : 'background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.3);'
        }
    `;
    messageEl.textContent = message;
    
    // Insert after form
    form.parentNode.insertBefore(messageEl, form.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageEl.style.transition = 'opacity 0.3s';
        messageEl.style.opacity = '0';
        setTimeout(() => messageEl.remove(), 300);
    }, 5000);
}

/**
 * Show newsletter message
 */
function showNewsletterMessage(messageEl, message, type) {
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    messageEl.style.color = type === 'success' ? '#059669' : '#dc2626';
    messageEl.style.padding = '0.75rem';
    messageEl.style.borderRadius = '8px';
    messageEl.style.background = type === 'success' 
        ? 'rgba(16, 185, 129, 0.1)' 
        : 'rgba(239, 68, 68, 0.1)';
    messageEl.style.border = `1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.style.transition = 'opacity 0.3s';
        messageEl.style.opacity = '0';
        setTimeout(() => {
            messageEl.style.display = 'none';
            messageEl.style.opacity = '1';
        }, 300);
    }, 5000);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterForm);
    }
});

// Export for use in inline scripts
if (typeof window !== 'undefined') {
    window.handleNewsletterSubmit = handleNewsletterForm;
}
