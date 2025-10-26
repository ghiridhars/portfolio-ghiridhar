// ========================================
// CONTACT PAGE JAVASCRIPT
// Handles form validation and submission with EmailJS
// ========================================

// EmailJS Configuration
// TODO: Replace these with your actual EmailJS credentials after setup
const EMAILJS_CONFIG = {
    publicKey: '69LxOrKxBmjYwNt--S7L8',      // Replace with your Public Key from EmailJS
    serviceID: 'service_pjs4ip8',       // Replace with your Service ID
    templateID: 'template_hogmok8'      // Replace with your Template ID
};

// Initialize EmailJS when page loads
(function() {
    if (EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('✅ EmailJS initialized');
    } else {
        console.warn('⚠️ EmailJS not configured. Please update EMAILJS_CONFIG in contact.js');
    }
})();

/**
 * Form Validation
 * Validates form inputs before submission
 */
function validateForm(formData) {
    const errors = [];
    
    // Validate name
    if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Validate subject
    if (!formData.subject || formData.subject.trim().length < 3) {
        errors.push('Subject must be at least 3 characters long');
    }
    
    // Validate message
    if (!formData.message || formData.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
}

/**
 * Display Form Message
 * Shows success or error messages to the user
 */
function showFormMessage(message, type = 'success') {
    const messageElement = document.getElementById('formMessage');
    
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.className = 'form-message';
        }, 5000);
    }
}

/**
 * Handle Form Submission with EmailJS
 * Processes the contact form and sends email via EmailJS
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value
    };
    
    // Validate form
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        showFormMessage(errors.join('. '), 'error');
        console.log('Form validation errors:', errors);
        return;
    }
    
    // Check if EmailJS is configured
    if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        showFormMessage('Email service not configured. Please contact via email directly.', 'error');
        console.error('❌ EmailJS not configured! Update EMAILJS_CONFIG in contact.js');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Prepare template parameters for EmailJS
    const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_name: 'Ghiridhar' // Your name - customize as needed
    };
    
    // Send email via EmailJS
    emailjs.send(
        EMAILJS_CONFIG.serviceID,
        EMAILJS_CONFIG.templateID,
        templateParams
    )
    .then((response) => {
        console.log('✅ Email sent successfully!', response.status, response.text);
        
        // Show success message
        showFormMessage('Thank you for your message! I will get back to you soon. 📧', 'success');
        
        // Reset form
        form.reset();
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    })
    .catch((error) => {
        console.error('❌ Failed to send email:', error);
        
        // Show error message with helpful info
        let errorMessage = 'Sorry, there was an error sending your message. Please try again or email me directly.';
        
        if (error.text) {
            console.error('Error details:', error.text);
        }
        
        showFormMessage(errorMessage, 'error');
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    });
}

/**
 * Add real-time validation feedback
 * Provides immediate feedback as user types
 */
function initRealtimeValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            const value = input.value.trim();
            const inputName = input.name;
            
            // Simple validation on blur
            if (inputName === 'name' && value.length > 0 && value.length < 2) {
                input.style.borderColor = 'var(--error-color)';
            } else if (inputName === 'email' && value.length > 0) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                input.style.borderColor = emailRegex.test(value) 
                    ? 'var(--success-color)' 
                    : 'var(--error-color)';
            } else if (value.length > 0) {
                input.style.borderColor = 'var(--success-color)';
            }
        });
        
        // Reset border color on focus
        input.addEventListener('focus', () => {
            input.style.borderColor = 'var(--primary-color)';
        });
    });
}

/**
 * Initialize contact page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        initRealtimeValidation();
        console.log('Contact form initialized! 📧');
    }
});
