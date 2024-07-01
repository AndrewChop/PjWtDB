document.addEventListener('DOMContentLoaded', function() {
    setupProfileLink();
    setupLogoutLink();
    setupUploadProfileImage(); // Aggiungi questa linea
    loadUserProfileImage(); // Aggiungi questa linea
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
    if (typeof localStorage !== 'undefined' && localStorage !== null) {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            localStorage.removeItem('jwtToken');
        } else {
            console.warn("Token not found");
        }
    } else {
        console.warn("LocalStorage not available");
    }
    if (typeof window !== 'undefined' && window !== null) {
        window.location.href = '../index.html';
    }
}

function setupUploadProfileImage() {
    const uploadButton = document.getElementById('uploadProfileImage');
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = function(event) {
                const file = event.target.files[0];
                if (file) {
                    console.log('File selected for upload:', file);
                    uploadProfileImage(file);
                }
            };
            fileInput.click();
        });
    }
}

function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('profileImage', file);

    console.log('Uploading profile image...');
    
    fetch('http://192.168.1.6:3000/api/upload-profile-image', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to upload profile image');
        }
        return response.json();
    })
    .then(data => {
        console.log('Profile image uploaded successfully:', data);
        // Aggiorna l'immagine del profilo nella pagina
        document.querySelector('.profile-image').src = data.imageUrl;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to upload profile image');
    });
}

function loadUserProfileImage() {
    console.log('Loading user profile image...');
    
    fetch('http://192.168.1.6:3000/api/user/data', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load user data');
        }
        return response.json();
    })
    .then(data => {
        console.log('User data loaded:', data);
        if (data.profileImage) {
            document.querySelector('.profile-image').src = data.profileImage;
        }
    })
    .catch(error => {
        console.error('Error loading user profile image:', error);
    });
}
