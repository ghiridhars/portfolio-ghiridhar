// ========================================
// CONTACT PAGE JAVASCRIPT
// Handles form validation and submission
// ========================================

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
 * Handle Form Submission
 * Processes the contact form
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
    
    // Simulate form submission
    // In a real application, you would send this data to a server
    console.log('Form data:', formData);
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        // Show success message
        showFormMessage('Thank you for your message! I will get back to you soon.', 'success');
        
        // Reset form
        form.reset();
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        console.log('Form submitted successfully! ✉️');
    }, 1500);
    
    /* 
     * IMPORTANT: To actually send emails, you'll need to:
     * 1. Use a service like Formspree, EmailJS, or Netlify Forms
     * 2. Set up a backend API endpoint
     * 3. Use a serverless function (e.g., Netlify Functions)
     * 
     * Example with Formspree:
     * - Sign up at formspree.io
     * - Get your form endpoint
     * - Replace the setTimeout above with:
     * 
     * fetch('https://formspree.io/f/YOUR_FORM_ID', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(formData)
     * })
     * .then(response => response.json())
     * .then(data => {
     *     showFormMessage('Message sent successfully!', 'success');
     *     form.reset();
     * })
     * .catch(error => {
     *     showFormMessage('Error sending message. Please try again.', 'error');
     *     console.error('Error:', error);
     * });
     */
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
