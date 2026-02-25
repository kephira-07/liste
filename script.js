 (function() {
            // ================= CONFIGURATION SUPABASE =================
            // Remplacez ces valeurs par celles de votre projet Supabase
            const SUPABASE_URL = 'https://votre-projet.supabase.co'; // Ex: 'https://xyzabc.supabase.co'
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydnlpdWJqZnl6d2RxZnJlYmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5ODUzNDAsImV4cCI6MjA4NzU2MTM0MH0.qmY2OGo9B4xg9YUj-ti_UPLh5nD7RYpPvHO35Bjl4wk'; // Votre clé anon publique

            // Initialisation du client Supabase
            const { createClient } = supabase;
            const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Récupération des éléments DOM
            const form = document.getElementById('myForm');
            const nomInput = document.getElementById('nom');
            const prenomInput = document.getElementById('prenom');
            const telephoneInput = document.getElementById('telephone');
            const emailInput = document.getElementById('email');
            const successMessage = document.getElementById('successMessage');
            const errorGlobal = document.getElementById('errorGlobal');
            const submitBtn = document.getElementById('submitBtn');

            // Récupération des conteneurs pour l'effet focus
            const inputGroups = document.querySelectorAll('.input-group');
            inputGroups.forEach(group => {
                const input = group.querySelector('input');
                input.addEventListener('focus', () => {
                    group.classList.add('focus');
                });
                input.addEventListener('blur', () => {
                    group.classList.remove('focus');
                });
            });

            // Fonctions de validation (inchangées)
            function validateNom() {
                const nom = nomInput.value.trim();
                const errorSpan = document.getElementById('error-nom');
                if (nom === '') {
                    errorSpan.textContent = 'Le nom est requis.';
                    return false;
                } else {
                    errorSpan.textContent = '';
                    return true;
                }
            }

            function validatePrenom() {
                const prenom = prenomInput.value.trim();
                const errorSpan = document.getElementById('error-prenom');
                if (prenom === '') {
                    errorSpan.textContent = 'Le prénom est requis.';
                    return false;
                } else {
                    errorSpan.textContent = '';
                    return true;
                }
            }

            function validateTelephone() {
                const telephone = telephoneInput.value.trim();
                const errorSpan = document.getElementById('error-telephone');
                const digits = telephone.replace(/\D/g, '');
                if (telephone === '') {
                    errorSpan.textContent = 'Le téléphone est requis.';
                    return false;
                } else if (digits.length < 10) {
                    errorSpan.textContent = 'Veuillez entrer au moins 10 chiffres.';
                    return false;
                } else {
                    errorSpan.textContent = '';
                    return true;
                }
            }

            function validateEmail() {
                const email = emailInput.value.trim();
                const errorSpan = document.getElementById('error-email');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (email === '') {
                    errorSpan.textContent = 'L\'email est requis.';
                    return false;
                } else if (!emailRegex.test(email)) {
                    errorSpan.textContent = 'Format d\'email invalide.';
                    return false;
                } else {
                    errorSpan.textContent = '';
                    return true;
                }
            }

            // Afficher/Masquer les messages d'erreur avec animation
            function showError(inputId, isValid) {
                const errorSpan = document.getElementById(`error-${inputId}`);
                if (!isValid) {
                    errorSpan.classList.add('visible');
                } else {
                    errorSpan.classList.remove('visible');
                }
            }

            // Validation en temps réel
            nomInput.addEventListener('input', () => {
                const isValid = validateNom();
                showError('nom', isValid);
            });
            prenomInput.addEventListener('input', () => {
                const isValid = validatePrenom();
                showError('prenom', isValid);
            });
            telephoneInput.addEventListener('input', () => {
                const isValid = validateTelephone();
                showError('telephone', isValid);
            });
            emailInput.addEventListener('input', () => {
                const isValid = validateEmail();
                showError('email', isValid);
            });

            // Fonction pour afficher/cacher les messages globaux
            function showGlobalMessage(type, show) {
                if (type === 'success') {
                    if (show) successMessage.classList.add('show');
                    else successMessage.classList.remove('show');
                } else if (type === 'error') {
                    if (show) errorGlobal.classList.add('show');
                    else errorGlobal.classList.remove('show');
                }
            }

            // Soumission du formulaire avec Supabase
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Valider tous les champs
                const isNomValid = validateNom();
                const isPrenomValid = validatePrenom();
                const isTelephoneValid = validateTelephone();
                const isEmailValid = validateEmail();

                showError('nom', isNomValid);
                showError('prenom', isPrenomValid);
                showError('telephone', isTelephoneValid);
                showError('email', isEmailValid);

                if (!(isNomValid && isPrenomValid && isTelephoneValid && isEmailValid)) {
                    return; // Arrêter si validation échoue
                }

                // Préparer les données
                const formData = {
                    nom: nomInput.value.trim(),
                    prenom: prenomInput.value.trim(),
                    telephone: telephoneInput.value.trim(),
                    email: emailInput.value.trim()
                };

                // Désactiver le bouton pendant l'envoi pour éviter les doubles clics
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';

                try {
                    // Insérer dans Supabase (table "contacts")
                    const { data, error } = await supabaseClient
                        .from('contacts')
                        .insert([formData]);

                    if (error) {
                        throw error;
                    }

                    // Succès
                    showGlobalMessage('success', true);
                    showGlobalMessage('error', false);
                    form.reset(); // Réinitialiser le formulaire

                    // Cacher le message après 3 secondes
                    setTimeout(() => {
                        showGlobalMessage('success', false);
                    }, 3000);

                } catch (err) {
                    console.error('Erreur Supabase:', err);
                    showGlobalMessage('error', true);
                    showGlobalMessage('success', false);

                    // Cacher le message d'erreur après 4 secondes
                    setTimeout(() => {
                        showGlobalMessage('error', false);
                    }, 4000);

                } finally {
                    // Réactiver le bouton
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 8px;"></i>Envoyer';
                }
            });
        })();