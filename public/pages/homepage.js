// Ottieni elementi del menu
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
}




