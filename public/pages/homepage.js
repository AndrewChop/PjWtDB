document.addEventListener('DOMContentLoaded', function() {
    setupProfileLink();
    setupLogoutLink();
    checkUserRoleAndAdjustUI();
});

function setupProfileLink() {
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            loadProfilePage();
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

function loadProfilePage() {
    // Qui puoi usare AJAX per caricare il contenuto HTML della pagina del profilo
    // Assicurati che il file profile.html esista nel percorso corretto
    fetch('../components/user-profile/profile.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('profileContent').innerHTML = html;
            // Potresti voler chiamare una funzione per popolare i dati dell'utente qui
        })
        .catch(error => console.error('Errore nel caricamento della pagina del profilo:', error));
}

function performLogout() {
    // Rimuovi il token JWT dallo storage locale
    localStorage.removeItem('jwtToken');
    // Reindirizza l'utente alla pagina di login
    window.location.href = '../index.html';
}

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
        adjustUIBasedOnRole(userRole);
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







/*document.addEventListener('DOMContentLoaded', function() {
  // Ottieni elementi del menu
  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");

  // Aggiungi un event listener al link "Profile"
  if (profileLink) {
    profileLink.addEventListener('click', function(e) {
        e.preventDefault();
        loadProfileEditPage();
    });
  }

  // Aggiungi un event listener al link "Logout"
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });
  }

  // Carica la pagina di modifica del profilo con AJAX
  function loadProfileEditPage() {
      fetch('../components/user-profile/profile.html')
          .then(response => response.text())
          .then(html => {
              // Assicurati che l'elemento 'profileEdit' esista nel tuo HTML
              document.getElementById('profileEdit').innerHTML = html;
          })
          .catch(error => console.error('Errore nel caricamento:', error));
  }

  // Funzione per effettuare il logout
  function logoutUser() {
      localStorage.removeItem('jwtToken');
      window.location.href = '../index.html';
  }
});*/




/*document.addEventListener('DOMContentLoaded', function() {
  // Ottieni elementi del menu
  const userProfile = document.getElementById("userProfile");
  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");
  const dropdownContent = document.querySelector(".dropdown-content");

  // Verifica se gli elementi esistono prima di aggiungere event listener
  if (profileLink) {
      profileLink.addEventListener('click', function(e) {
          e.preventDefault();
          loadProfileEditPage();
      });
  }

  if (logoutLink) {
      logoutLink.addEventListener('click', function(e) {
          e.preventDefault();
          logoutUser();
      });
  }

  // Carica la pagina di modifica del profilo con AJAX
  function loadProfileEditPage() {
      fetch('../components/user-profile/profile.html')
          .then(response => {
              if (!response.ok) {
                  throw new Error('Non è stato possibile caricare la pagina del profilo');
              }
              return response.text();
          })
          .then(html => {
              document.getElementById('profileEdit').innerHTML = html;
          })
          .catch(error => {
              console.error('Errore nel caricamento della pagina del profilo:', error);
          });
  }

  // Funzione per effettuare il logout
  function logoutUser() {
      // Rimozione del token JWT dal localStorage
      localStorage.removeItem('jwtToken');
      // Reindirizzamento alla pagina di login
      window.location.href = '../index.html';
  }
});*/





/*/ Ottieni elementi del menu
const userProfile = document.getElementById("userProfile");
const profileLink = document.getElementById("profileLink");
const logoutLink = document.getElementById("logoutLink");
const dropdownContent = document.querySelector(".dropdown-content");

// Aggiungi un event listener al link "Profile" per gestire l'apertura della pagina di modifica del profilo
profileLink.addEventListener('click', (e) => {
  e.preventDefault(); // Previeni l'azione predefinita del link
  // Nascondi i dettagli del profilo
  document.getElementById('profileDetails').style.display = 'none';
  // Carica la pagina di modifica del profilo (profile.html) con AJAX
  loadProfileEditPage();
});

// Funzione per caricare la pagina di modifica del profilo con AJAX
function loadProfileEditPage() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'profile.html', true);
  xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
          // Mostra la pagina di modifica del profilo e nascondi i dettagli
          document.getElementById('profileEdit').innerHTML = xhr.responseText;
          document.getElementById('profileEdit').style.display = 'block';
      }
  };
  xhr.send();
}*/