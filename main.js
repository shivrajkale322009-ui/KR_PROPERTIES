document.addEventListener('DOMContentLoaded', () => {
    // Language Toggle logic
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // In a production app, we would swap JSON translations here
            const lang = btn.textContent;
            console.log('Language switched to:', lang);
        });
    });

    // Handle Form Inquiries
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('input[type="text"]').value;
            const phone = contactForm.querySelector('input[type="tel"]').value;
            
            if (!name || phone.length < 10) {
                alert('Please provide your name and 10-digit phone number.');
                return;
            }
            
            alert(`Thank you ${name}! Jeevan Kale will contact you on ${phone} within 1 hour.`);
            contactForm.reset();
        });
    }

    // Scroll Header Shadow
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 30) {
            header.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // Pre-fill WhatsApp tracking (optional logic can go here)
});
