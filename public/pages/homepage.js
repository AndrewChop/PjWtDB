document.addEventListener('DOMContentLoaded', function() {
    setupProfileLink();
    //loadUsersByRole('volunteers');
    //loadUsersByRole('students');
    setupLogoutLink();
    //checkUserRoleAndAdjustUI();
    console.log('Pagina caricata correttamente');
});

function setupProfileLink() {
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            //loadProfilePage(); reindirizzo direttamente alla pagina senza fare una richiesta AJAX
            window.location.href = '../components/user-profile/profile.html';
        });
    }
}
/*
async function loadUsersByRole(role) {
    try {
      const response = await fetch(`/api/users/${role}`);
      const users = await response.json();
      const userListElement = document.getElementById(`${role}List`);
      if (userListElement) {
        const userList = userListElement.querySelector('ul');
        userList.innerHTML = ''; // Rimuovi gli elementi esistenti
        users.forEach(user => {
          const listItem = document.createElement('li');
          listItem.textContent = `${user.name} ${user.surname}`;
          userList.appendChild(listItem);
        });
      } else {
        console.error("Elemento con id non trovato");
      }
    } catch (error) {
      console.error('Errore nel caricamento degli utenti:', error);
    }
}
*/
  

function setupLogoutLink() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            performLogout();
        });
    }
}
/*
function loadProfilePage() {
    // Qui puoi usare AJAX per caricare il contenuto HTML della pagina del profilo
    fetch('../components/user-profile/profile.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('profileContent').innerHTML = html;
            // Potresti voler chiamare una funzione per popolare i dati dell'utente qui
        })
        .catch(error => console.error('Errore nel caricamento della pagina del profilo:', error));
}*/

function performLogout() {
    // Rimuovi il token JWT dallo storage locale
    if (typeof localStorage!== 'undefined' && localStorage!== null) {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            localStorage.removeItem('jwtToken');
        } else {
            console.warn("Token non trovato");
        }
    } else {
        console.warn("LocalStorage non disponibile");
    }

    // Reindirizza l'utente alla pagina di login
    if (typeof window!== 'undefined' && window!== null) {
        window.location.href = '../index.html';
    }
}

/*
function checkUserRoleAndAdjustUI() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.error("Token non trovato");
        return;
    }

    fetch('/api/user/role', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) throw new Error('Errore nel recupero del ruolo');
        return response.json();
    })
    .then(data => {
        const userRole = data.role;
        //adjustUIBasedOnRole(userRole); DA IMPLEMENTARE
    })
    .catch(error => console.error('Errore:', error));
}


function adjustUIBasedOnRole(role) {
    // Implementa qui le modifiche dell'UI basate sul ruolo
    if (role === 'ADMIN') {
        // Attiva funzioni admin document.getElementById('adminPanel').style.display = 'block';
    } else if (role === 'VOLUNTEER') {
        // Attiva funzioni volontari document.getElementById('volunteerTools').style.display = 'block';
    } else if (role === 'STUDENT') {
        // Attiva funzioni studenti document.getElementById('adminPanel').style.display = 'none';
        //document.getElementById('volunteerTools').style.display = 'none';
    }
}
*/
