/**
 * Script de migration de l'ancienne base de données PHP/MySQL vers le nouveau schéma Spring Boot.
 * Ce script lit un fichier d'export (ou simule ici une ancienne source) et insère les données 
 * dans la nouvelle base via l'API REST.
 * 
 * Prérequis : 
 * npm install axios
 */

const axios = require('axios');

// Simulation des données extraites de l'ancienne base (PHP/MySQL)
const legacyData = [
  {
    old_id: 101,
    titre: "Impact de l'IA en imagerie médicale",
    auteurs_complets: "Dr. Dupont J., Pr. Martin M.",
    resume: "Une étude sur l'impact de l'IA générative dans l'interprétation des IRM.",
    theme: "Intelligence Artificielle",
    salle_affectee: "Amphi A",
    fichier_pdf: "poster_101.pdf"
  },
  {
    old_id: 102,
    titre: "Nouvelles approches thérapeutiques en oncologie",
    auteurs_complets: "Dr. Curie M.",
    resume: "Revue des thérapies ciblées récentes.",
    theme: "Oncologie",
    salle_affectee: "Salle 4",
    fichier_pdf: "poster_102.pdf"
  }
];

const API_URL = 'http://localhost:8080/api';

async function migrate() {
  console.log('🚀 Démarrage de la migration des données...');
  
  // 1. On peut d'abord devoir s'authentifier si l'API est protégée (ou on peut utiliser un token admin)
  // Pour la simulation, on suppose que l'API est accessible en POST /publications pour l'admin
  // const token = await login('admin', 'password');
  // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  let successCount = 0;
  let errorCount = 0;

  for (const item of legacyData) {
    try {
      // 2. Mapping vers le nouveau modèle de données
      const newPublication = {
        title: item.titre,
        authors: item.auteurs_complets,
        abstractText: item.resume,
        category: item.theme,
        room: item.salle_affectee,
        posterUrl: `/uploads/${item.fichier_pdf}`, // Simulation de chemin
        status: "PUBLISHED"
      };

      console.log(`Traitement de l'ancien poster #${item.old_id} : ${item.titre}...`);
      
      // 3. Insertion via l'API REST (ou via mysql2 en direct si préféré)
      // await axios.post(`${API_URL}/publications`, newPublication);
      
      // Pour éviter les erreurs réseau sans backend allumé :
      console.log(`[SIMULATION OK] POST ${API_URL}/publications -> `, newPublication);
      
      successCount++;
    } catch (error) {
      console.error(`Erreur lors de l'import de #${item.old_id}:`, error.message);
      errorCount++;
    }
  }

  console.log('✅ Migration terminée !');
  console.log(`Résultats : ${successCount} succès, ${errorCount} erreurs.`);
}

migrate();
