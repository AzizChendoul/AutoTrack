const STORAGE_KEY = 'autotrack_data_v4'; 

// Données par défaut
const defaultData = { 
    vehicle: { owner:'', model:'', mileage:0, plate:'' }, 
    maintenances: [] 
};

function load() { 
    const r = localStorage.getItem(STORAGE_KEY); 
    try { return r ? JSON.parse(r) : defaultData; } catch(e) { return defaultData; }
}

function save(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

let data = load();

function uid() { return Math.random().toString(36).slice(2,9); }

// --- INITIALISATION ---
function initForms() {
  document.getElementById('owner').value = data.vehicle.owner || '';
  document.getElementById('model').value = data.vehicle.model || '';
  document.getElementById('mileage').value = data.vehicle.mileage || 0;
  document.getElementById('plate').value = data.vehicle.plate || '';

  // --- GESTION INTELLIGENTE DU FORMULAIRE ---
  const typeSelect = document.getElementById('mType');
  const kmInput = document.getElementById('mMileage');
  const nextDateDiv = document.getElementById('divNextDate');
  const nextDateInput = document.getElementById('mNextDate');

  // Ces types demandent une date d'expiration, pas des km
  const timeBasedTypes = ['Assurance', 'Vignette', 'Batterie', 'Contrôle Technique'];

  function checkType() {
      if (timeBasedTypes.includes(typeSelect.value)) {
          // MODE TEMPS : On demande la date d'expiration
          kmInput.value = 0;
          kmInput.disabled = true;
          kmInput.style.backgroundColor = "#e9ecef"; // Gris
          
          nextDateDiv.style.display = 'block'; // Afficher la date
          nextDateInput.required = true; // Rendre obligatoire
      } else {
          // MODE KILOMÈTRE : Classique
          kmInput.disabled = false;
          kmInput.style.backgroundColor = "white";
          
          nextDateDiv.style.display = 'none'; // Cacher la date
          nextDateInput.required = false;
          nextDateInput.value = ""; 
      }
  }

  typeSelect.addEventListener('change', checkType);
  checkType(); // Lancer au démarrage

  // 1. Sauvegarder Véhicule
  document.getElementById('vehicleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    data.vehicle.owner = document.getElementById('owner').value;
    data.vehicle.model = document.getElementById('model').value;
    data.vehicle.mileage = Number(document.getElementById('mileage').value);
    data.vehicle.plate = document.getElementById('plate').value;
    save(data); renderAll();
    alert('Véhicule enregistré !');
  });

  // 2. Ajouter Maintenance
  document.getElementById('maintForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const maint = {
      id: uid(),
      date: document.getElementById('mDate').value,
      type: document.getElementById('mType').value,
      mileage: Number(document.getElementById('mMileage').value),
      cost: Number(document.getElementById('mCost').value) || 0,
      notes: document.getElementById('mNotes').value || '',
      // On sauvegarde la date d'expiration choisie par le client
      expirationDate: document.getElementById('mNextDate').value || null 
    };
    
    data.maintenances.push(maint);
    data.maintenances.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    // Mettre à jour le kilométrage global (sauf si c'est temporel)
    if (!timeBasedTypes.includes(maint.type) && maint.mileage > data.vehicle.mileage) {
        data.vehicle.mileage = maint.mileage;
        document.getElementById('mileage').value = data.vehicle.mileage;
    }

    save(data); renderAll(); e.target.reset();
    setTimeout(checkType, 10); 
  });

  // 3. Simuler IoT
  document.getElementById('btnSimIoT').addEventListener('click', () => {
    data.vehicle.mileage += 100;
    save(data); renderAll();
  });

  // 4. Notifications
  document.getElementById('btnRequestNotif').addEventListener('click', async () => {
    if (!('Notification' in window)) { alert("Navigateur incompatible."); return; }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') new Notification("AutoTrack", { body: "Notifications activées !" });
  });
  // 5. BOUTON CORBA : SYNCHRONISATION + CALCUL DU RESTE À FAIRE
  document.getElementById('btnCorba').addEventListener('click', () => {
      const btn = document.getElementById('btnCorba');
      const originalText = btn.textContent;
      btn.textContent = "Calculs en cours...";
      btn.disabled = true;

      setTimeout(() => {
          // 1. Kilométrage reçu du Serveur CORBA (Capteur)
          const corbaKm = 54200; 
          
          // 2. Mise à jour immédiate du véhicule
          data.vehicle.mileage = corbaKm;

          // 3. Définition des règles (Durée de vie des pièces)
          const regles = [
              { type: 'Vidange', vie: 10000 },
              { type: 'Courroie distribution', vie: 120000 },
              { type: 'Freins', vie: 30000 }
          ];

          let rapport = []; // On va stocker les résultats ici

          // 4. Calcul pour chaque pièce
          regles.forEach(regle => {
              // On cherche la DERNIÈRE fois qu'on a fait cette maintenance
              // (On ignore celles qui ont une date d'expiration manuelle)
              const derniereFois = data.maintenances.find(m => m.type === regle.type && !m.expirationDate);
              
              const kmDerniereFois = derniereFois ? derniereFois.mileage : 0;
              const prochainChangement = kmDerniereFois + regle.vie;
              const reste = prochainChangement - corbaKm;

              // On prépare le message pour cette pièce
              if (reste > 0) {
                  rapport.push(` ${regle.type} : Reste ${reste} km`);
              } else {
                  rapport.push(` ${regle.type} : DÉPASSÉ de ${Math.abs(reste)} km !`);
              }
          });

          // 5. Création du message final pour l'utilisateur
          const messageFinal = rapport.join('\n'); // Saute des lignes

          // 6. Sauvegarde d'une trace dans l'historique
          data.maintenances.push({
              id: uid(),
              date: new Date().toISOString().slice(0,10),
              type: 'Sync & Check',
              mileage: corbaKm,
              cost: 0,
              notes: `Bilan CORBA :\n` + messageFinal.replace(/\n/g, ', ') // On met sur une ligne pour le tableau
          });

          save(data);
          renderAll();

          btn.textContent = originalText;
          btn.disabled = false;
          
          // 7. Affichage du résultat à l'écran
          alert(`Mise à jour réussie (${corbaKm} km).\n\nBilan des pièces :\n${messageFinal}`);
          
      }, 1500);
  });
}

// --- AFFICHAGE ---
function renderHistory() { 
    const tbody = document.querySelector('#historyTable tbody'); 
    tbody.innerHTML = ''; 
    data.maintenances.forEach(m => { 
        // Affichage conditionnel
        let displayKm = `${m.mileage} km`;
        if(m.expirationDate) {
            displayKm = `<span class="badge bg-info text-dark">Exp: ${m.expirationDate}</span>`;
        } else if (m.mileage === 0) {
            displayKm = '<span class="text-muted">---</span>';
        }

        const tr = document.createElement('tr'); 
        tr.innerHTML = `<td>${m.date}</td><td>${m.type}</td><td>${displayKm}</td><td>${m.cost.toFixed(2)} €</td><td>${m.notes}</td><td><button class="btn btn-sm btn-danger btn-delete" data-id="${m.id}">X</button></td>`; 
        tbody.appendChild(tr); 
    }); 
    document.querySelectorAll('.btn-delete').forEach(b => {
        b.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            data.maintenances = data.maintenances.filter(x => x.id !== id);
            save(data); renderAll();
        });
    });
}

function renderDashboard() {
    const container = document.getElementById('dashboard');
    container.innerHTML = `
        <div class="col-md-6"><div class="card p-3 text-center"><h5>Véhicule</h5><p class="lead mb-0">${data.vehicle.model || 'Non défini'}</p><small>${data.vehicle.owner || ''}</small></div></div>
        <div class="col-md-6"><div class="card p-3 text-center"><h5>Kilométrage</h5><p class="lead mb-0 text-primary fw-bold">${data.vehicle.mileage} km</p></div></div>
    `;
}

// --- RAPPELS BASÉS SUR LE CHOIX CLIENT ---
function renderReminders() {
    const list = document.getElementById('remindersList');
    list.innerHTML = '';
    const currentKm = data.vehicle.mileage;
    const today = new Date();

    const kmRules = [
        { type: 'Vidange', limit: 10000 },
        { type: 'Filtres', limit: 20000 },
        { type: 'Freins', limit: 30000 }
    ];

    let found = false;

    // 1. Vérifier les maintenances temporelles (Assurance, etc.)
    // On cherche celles qui ont une "expirationDate" définie par le client
    data.maintenances.forEach(m => {
        if (m.expirationDate) {
            const expDate = new Date(m.expirationDate);
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            // On vérifie seulement si c'est la dernière entrée de ce type pour ne pas spammer
            // (Simplification : on affiche tout ce qui expire bientôt)
            if (diffDays <= 0) {
                addAlert(`URGENT : ${m.type} expirée le ${m.expirationDate}`, 'danger');
            } else if (diffDays < 30) {
                addAlert(`Attention : ${m.type} expire dans ${diffDays} jours (${m.expirationDate})`, 'warning');
            }
        }
    });

    // 2. Vérifier les maintenances kilométriques
    kmRules.forEach(r => {
        // Trouver la dernière de ce type qui n'a PAS de date d'expiration (donc basée sur km)
        const last = data.maintenances.find(m => m.type === r.type && !m.expirationDate);
        if (last) {
            const nextKm = last.mileage + r.limit;
            const diff = nextKm - currentKm;
            if (diff <= 0) addAlert(`URGENT : ${r.type} à faire (Dû à ${nextKm} km)`, 'danger');
            else if (diff < 1000) addAlert(`Bientôt : ${r.type} dans ${diff} km`, 'warning');
        }
    });

    function addAlert(text, color) {
        const li = document.createElement('li');
        li.className = `list-group-item list-group-item-${color}`;
        li.textContent = text;
        list.appendChild(li);
        found = true;
    }

    if(!found) list.innerHTML = '<li class="list-group-item text-muted">Aucun rappel imminent.</li>';
}

function renderAll() { renderDashboard(); renderHistory(); renderReminders(); document.getElementById('mileage').value = data.vehicle.mileage; }

initForms(); renderAll();