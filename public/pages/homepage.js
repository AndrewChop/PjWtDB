document.addEventListener('DOMContentLoaded', function() {
    setupProfileLink();
    setupLogoutLink();
    setupUploadProfileImage();
    loadUserProfileImage();
    console.log('Page loaded correctly!');
    setupDropdowns();
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

/* function setupUploadProfileImage() {
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
} */

function setupUploadProfileImage() {
    const uploadButton = document.getElementById('uploadProfileImage');
    if (uploadButton) {
        uploadButton.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';

            fileInput.onchange = event => {
                const file = event.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('profileImage', file);

                    fetch('/api/upload-profile-image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                        },
                        body: formData,
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to upload profile image');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.imageUrl) {
                            document.querySelector('.profile-image').src = data.imageUrl + `?t=${Date.now()}`;
                            alert('Profile image updated successfully!');
                        } else {
                            alert('Failed to update profile image.');
                        }
                    })
                    .catch(error => console.error('Error uploading profile image:', error));
                }
            };

            fileInput.click();
        });
    }
}

/* function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('profileImage', file);

    console.log('Uploading profile image...');
    
    fetch(`/api/upload-profile-image`, {
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
        const profileImage = document.querySelector('.profile-image');
        profileImage.src = data.imageUrl + `?t=${new Date().getTime()}`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to upload profile image');
    });
} */

function loadUserProfileImage() {
    console.log('Loading user profile image...');
    
    fetch(`/api/user/data`, {
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
            document.querySelector('.profile-image').src = data.profileImage + `?t=${Date.now()}`;
        }
    })
    .catch(error => {
        console.error('Error loading user profile image:', error);
    });
}

// Funzione per configurare l'apertura e la chiusura dei menu a tendina
function setupDropdowns() {
    const buttons = document.querySelectorAll('.main-button');

    buttons.forEach(button => {
        const dropdown = button.querySelector('.dropdown-content');

        // Mostra il menu al passaggio del mouse
        button.addEventListener('mouseenter', () => {
            dropdown.style.display = 'block';
        });

        // Nasconde il menu quando il mouse esce sia dal pulsante che dal menu
        button.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!dropdown.matches(':hover') && !button.matches(':hover')) {
                    dropdown.style.display = 'none';
                }
            }, 200);
        });

        // Previeni che il menu si nasconda se il cursore è sul menu
        dropdown.addEventListener('mouseenter', () => {
            dropdown.style.display = 'block';
        });

        dropdown.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!dropdown.matches(':hover') && !button.matches(':hover')) {
                    dropdown.style.display = 'none';
                }
            }, 200);
        });
    });
}