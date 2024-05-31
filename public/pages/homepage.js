document.addEventListener('DOMContentLoaded', function() {
    setupProfileLink();
    setupLogoutLink();
    console.log('Page loaded correctly!');
});

function setupProfileLink() {
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../components/user-profile/profile.html';
        });
    }
} 

function setupLogoutLink() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            performLogout();
        });
    }
}

function performLogout() {
    // Rimuovi il token JWT dallo storage locale
    if (typeof localStorage!== 'undefined' && localStorage!== null) {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            localStorage.removeItem('jwtToken');
        } else {
            console.warn("Token not found");
        }
    } else {
        console.warn("LocalStorage not available");
    }

    // Reindirizza l'utente alla pagina di login
    if (typeof window!== 'undefined' && window!== null) {
        window.location.href = '../index.html';
    }
}