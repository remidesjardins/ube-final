document.addEventListener("DOMContentLoaded", () => {
    // User login
    const userLoginBtn = document.getElementById('user-login-btn');
    const userEmail = document.getElementById('user-email');
    const userPassword = document.getElementById('user-password');

    if (userLoginBtn && userEmail && userPassword) {
        // Add enter key support
        [userEmail, userPassword].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    userLoginBtn.click();
                }
            });
        });

        userLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const email = userEmail.value.trim();
            const password = userPassword.value.trim();

            if (!email || !password) {
                alert('Veuillez remplir tous les champs');
                return;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        mdp: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Store user data in localStorage
                    localStorage.setItem('user', JSON.stringify(data));
                    localStorage.setItem('connected', 'true');
                    // Redirect to home page
                    window.location.href = '/index.html';
                } else {
                    alert(data.error || 'Erreur lors de la connexion');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Une erreur est survenue lors de la connexion');
            }
        });
    }

    // Admin login
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminEmail = document.getElementById('admin-email');
    const adminPassword = document.getElementById('admin-password');
    const adminImmatriculation = document.getElementById('admin-immatriculation');

    if (adminLoginBtn && adminEmail && adminPassword && adminImmatriculation) {
        // Add enter key support
        [adminEmail, adminPassword, adminImmatriculation].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submission
                    adminLoginBtn.click();
                }
            });
        });

        adminLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent form submission
            const email = adminEmail.value.trim();
            const password = adminPassword.value.trim();
            const immatriculation = adminImmatriculation.value.trim();

            if (!email || !password || !immatriculation) {
                alert('Veuillez remplir tous les champs');
                return;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        mdp: password,
                        immatriculation: immatriculation
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Store admin data in localStorage
                    localStorage.setItem('admin', JSON.stringify(data));
                    // Redirect to admin dashboard
                    window.location.href = '/admin/dashboard.html';
                } else {
                    alert(data.error || 'Erreur lors de la connexion admin');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Une erreur est survenue lors de la connexion admin');
            }
        });
    }

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent form submission
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.src = '/img/oeil_ferme.webp';
            } else {
                passwordInput.type = 'password';
                this.src = '/img/oeil_ouvert.webp';
            }
        });
    });

    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.getElementById('navbar');
    if (hamburger && navbar) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            navbar.classList.toggle('active');
        });
    }
});
