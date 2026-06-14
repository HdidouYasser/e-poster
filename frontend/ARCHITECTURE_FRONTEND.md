# Architecture du Projet Frontend — Plateforme E-Poster

## Vue d'ensemble

Le frontend de la plateforme E-Poster est une application **React 18** (Single Page Application) construite avec **Vite** comme bundler et **Tailwind CSS** pour le stylisage. L'application se divise en deux grands espaces :

- **Front-Office (Totem)** : Interface publique de consultation des E-Posters sur bornes tactiles et mobile.
- **Back-Office (Admin)** : Interface d'administration et de gestion pour les administrateurs et les responsables d'événements.

---

## Arborescence des fichiers

```
frontend/
├── .env                          # Variables d'environnement
├── index.html                    # Page HTML racine
├── package.json                  # Dépendances et scripts npm
├── package-lock.json             # Verrouillage des versions
├── postcss.config.js             # Configuration PostCSS
├── tailwind.config.js            # Configuration Tailwind CSS
├── vite.config.js                # Configuration Vite (bundler)
│
├── public/
│   └── assets/
│       └── import_test.csv       # Fichier CSV de test pour l'import
│
└── src/
    ├── api.js                    # Client HTTP (Axios)
    ├── App.jsx                   # Composant racine et routage
    ├── Home.jsx                  # Page d'accueil publique
    ├── index.css                 # Styles globaux
    ├── main.jsx                  # Point d'entrée React
    │
    ├── admin/                    # Back-Office (Admin & Responsable)
    │   ├── AdminLayout.jsx       # Layout principal du back-office
    │   ├── AuditAdmin.jsx        # Gestion des journaux d'audit
    │   ├── AuthorsAdmin.jsx      # Gestion des auteurs
    │   ├── CategoriesAdmin.jsx   # Gestion des catégories/thèmes
    │   ├── EventsAdmin.jsx       # Gestion des événements/congrès
    │   ├── ExportAdmin.jsx       # Module d'exportation des données
    │   ├── ForgotPasswordPage.jsx # Page de récupération de mot de passe
    │   ├── ImportAdmin.jsx       # Module d'importation de masse
    │   ├── LoginPage.jsx         # Page de connexion
    │   ├── ManagersAdmin.jsx     # Gestion des responsables
    │   ├── ProfilePage.jsx       # Page de profil utilisateur
    │   ├── PublicationsAdmin.jsx # Gestion des E-Posters
    │   ├── RegisterPage.jsx      # Page d'inscription
    │   ├── ResetPasswordPage.jsx # Page de réinitialisation du mot de passe
    │   ├── ScreensAdmin.jsx      # Gestion des bornes/écrans totem
    │   └── StatsAdmin.jsx        # Tableau de bord statistique
    │
    ├── components/               # Composants UI réutilisables
    │   ├── DataTable.jsx         # Tableau de données générique
    │   ├── Form.jsx              # Formulaire dynamique réutilisable
    │   ├── LoadingState.jsx      # Indicateur de chargement
    │   ├── Pagination.jsx        # Composant de pagination
    │   ├── QRCodeGenerator.jsx   # Générateur de QR Code
    │   └── totem/
    │       ├── TotemLayout.jsx   # Layout du mode borne totem
    │       └── TotemUI.jsx       # Interface tactile du totem
    │
    ├── hooks/                    # Hooks personnalisés
    │   ├── useCRUD.js            # Hook générique CRUD
    │   ├── useDynamicTheme.js    # Hook de thématisation dynamique
    │   ├── useIdleTimer.js       # Hook de détection d'inactivité
    │   ├── usePagination.js      # Hook de gestion de pagination
    │   └── useTotemApi.js        # Hook d'appels API pour le totem
    │
    ├── lib/                      # Utilitaires
    │   └── cn.js                 # Utilitaire de concaténation de classes CSS
    │
    ├── schemas/                  # Schémas de validation
    │   └── forms.ts              # Définitions des formulaires (TypeScript)
    │
    ├── stores/                   # State management (Zustand)
    │   ├── authStore.js          # Store d'authentification
    │   └── totemStore.js         # Store de l'état du mode totem
    │
    └── totem/                    # Front-Office (Borne Totem)
        ├── TotemEventsDisplay.jsx # Affichage des événements
        ├── TotemHome.jsx          # Accueil du mode totem
        ├── TotemPosterDetail.jsx  # Détail d'un E-Poster
        ├── TotemPublications.jsx  # Liste des publications
        ├── TotemSlideshow.jsx     # Mode diaporama
        └── totemSync.js           # Synchronisation multi-écrans
```

---

## Description détaillée des fichiers

### Fichiers de configuration racine

| Fichier | Description |
|---------|-------------|
| **`.env`** | Variables d'environnement Vite : URL de l'API backend (`VITE_API_URL`) et identifiant client Google OAuth2 (`VITE_GOOGLE_CLIENT_ID`). Ces variables sont injectées au moment du build via `import.meta.env`. |
| **`index.html`** | Page HTML racine de l'application. Contient le point de montage `<div id="root">` et le script d'entrée `main.jsx`. Inclut les polices Google Fonts et les métadonnées SEO. |
| **`package.json`** | Manifeste du projet Node.js. Déclare les dépendances principales : React 18, React Router, Axios, Tailwind CSS, TanStack Query (React Query), Zustand, react-hot-toast, qrcode.react, lucide-react. |
| **`postcss.config.js`** | Configuration PostCSS pour le traitement des fichiers CSS, nécessaire à l'intégration de Tailwind CSS et de l'Autoprefixer. |
| **`tailwind.config.js`** | Configuration de Tailwind CSS : définition des couleurs personnalisées, extensions de thème, polices et breakpoints adaptés à la charte graphique de la plateforme E-Poster. |
| **`vite.config.js`** | Configuration du bundler Vite : alias de chemins, serveur de développement avec proxy vers l'API backend, optimisation du build de production. |

---

### `src/main.jsx` — Point d'entrée React

Point d'entrée de l'application. Initialise le provider React Query (`QueryClientProvider`), le routeur (`BrowserRouter`) et monte le composant racine `<App />` dans le DOM. Charge également les styles globaux (`index.css`).

---

### `src/App.jsx` — Composant racine et routage

Définit l'ensemble des routes de l'application via React Router v6 :

- **Routes publiques (Totem)** : `/totem`, `/totem/publications`, `/totem/publications/:id`, `/totem/slideshow`
- **Page d'accueil** : `/` — Présente le concept de la plateforme
- **Routes d'authentification** : `/login`, `/register`, `/forgot-password`, `/reset-password`
- **Routes protégées (Admin)** : `/admin/*` — Nécessite une authentification JWT via le composant `<ProtectedRoute>`

Englobe l'application dans `<GoogleOAuthProvider>` pour l'authentification OAuth2 et `<Toaster>` pour les notifications.

---

### `src/api.js` — Client HTTP (Axios)

Module central de communication avec l'API REST backend. Exporte deux instances Axios :

- **`api`** : Instance authentifiée avec intercepteurs automatiques (ajout du header `Authorization: Bearer <token>` sur chaque requête, déconnexion automatique sur erreur 401/403).
- **`publicApi`** : Instance publique sans intercepteurs, utilisée par les composants Totem pour les endpoints accessibles sans authentification.
- **`getMediaUrl(path)`** : Fonction utilitaire qui résout les chemins de fichiers uploadés en URLs absolues, en gérant les cas localhost et cross-device.
- **`getPosterThumbnail(url)`** : Génère l'URL de la miniature JPEG pour les fichiers PDF uploadés (convention `thumb_*.jpg`).

---

### `src/Home.jsx` — Page d'accueil publique

Page de présentation de la plateforme E-Poster destinée aux visiteurs. Contient :

- **Header** avec navigation vers les espaces Congrès, E-Posters et l'Espace Organisateurs.
- **Hero** avec barre de recherche full-text et diaporama des événements actifs.
- **Section « Congrès Vedette »** avec QR codes pour le programme et la revue.
- **Carrousel horizontal** des congrès actifs avec navigation par flèches.
- **Panneaux double audience** (Visiteurs vs Organisateurs) décrivant les fonctionnalités de chaque espace.
- **Bandeau partenaires** avec défilement continu (marquee).
- **Section « Comment ça fonctionne »** en 3 étapes.
- **Grille de spécialités médicales** (Cardiologie, Neurologie, Chirurgie, etc.).
- **FAQ** interactive avec accordéon.
- **Footer** multi-colonnes avec liens vers les différents espaces.

---

### `src/index.css` — Styles globaux

Feuille de styles principale de l'application. Combine les directives Tailwind CSS (`@tailwind base/components/utilities`) avec des styles personnalisés pour :

- Les composants de la page d'accueil (classes `vh-*`, `prt-*`)
- Les animations (transitions, keyframes)
- Les boutons et composants UI réutilisables (classes `btn`, `page-header`, `page-title`)
- Le responsive design et les adaptations mobiles

---

## Back-Office — `src/admin/`

### `AdminLayout.jsx` — Layout principal du back-office

Structure en deux colonnes : barre latérale de navigation et zone de contenu. Le menu latéral affiche les liens selon le rôle de l'utilisateur :

- **Admin uniquement** : Toutes les sections (Stats, Events, Publications, Categories, Authors, Managers, Screens, Import, Audit, Export)
- **Responsable (Manager)** : Accès restreint (Dashboard, Events, Publications, Profile)

Inclut une carte utilisateur cliquable en bas de la sidebar qui redirige vers la page de profil.

---

### `StatsAdmin.jsx` — Tableau de bord statistique

Affiche les indicateurs clés de la plateforme : nombre total d'événements, publications, auteurs, catégories, vues cumulées. Présente des graphiques de répartition par catégorie et par événement, ainsi que les publications les plus consultées. Accessible uniquement à l'administrateur.

---

### `EventsAdmin.jsx` — Gestion des événements/congrès

Interface CRUD complète pour la gestion des congrès. Permet de :

- Créer un nouvel événement (titre, description, dates, lieu, logo, bannière, programme PDF, revue PDF)
- Modifier les événements existants
- Changer le statut (Actif, Planifié, Archivé)
- Supprimer un événement
- Visualiser la liste paginée avec recherche et filtrage

---

### `PublicationsAdmin.jsx` — Gestion des E-Posters

Interface CRUD pour la gestion des publications scientifiques. Chaque publication comprend : titre, auteurs (multi-sélection), catégorie, événement associé, fichier poster (PDF ou image), abstract. Permet le filtrage par événement et par catégorie.

---

### `CategoriesAdmin.jsx` — Gestion des catégories/thèmes

Gestion des domaines scientifiques (Cardiologie, Neurologie, Pédiatrie, etc.). Chaque catégorie possède un nom, une description et une couleur personnalisée utilisée pour le codage visuel dans l'interface Totem.

---

### `AuthorsAdmin.jsx` — Gestion des auteurs

Base de données des auteurs scientifiques. Chaque auteur contient : nom complet, affiliation institutionnelle, email, biographie courte. Les auteurs sont liés aux publications via une relation many-to-many.

---

### `ManagersAdmin.jsx` — Gestion des responsables d'événements

Administration des comptes responsables (ROLE_EVENT_MANAGER). Permet à l'administrateur de :

- Créer des comptes responsables et les assigner à des événements spécifiques
- Désactiver/réactiver des comptes
- Réinitialiser les mots de passe
- Visualiser les événements assignés à chaque responsable

---

### `ScreensAdmin.jsx` — Gestion des bornes/écrans totem

Configuration des écrans physiques (totems) déployés lors des événements. Chaque écran possède un identifiant unique, un nom, un emplacement physique et un événement assigné. Permet d'associer des publications spécifiques à chaque borne.

---

### `ImportAdmin.jsx` — Module d'importation de masse

Interface d'import en masse de publications scientifiques depuis des fichiers CSV ou Excel. Parse automatiquement les colonnes (titre, auteurs, abstract, catégorie) et crée les entités correspondantes en base. Gère le multi-auteurs et la déduplication. Affiche un rapport d'import avec statistiques (créés, ignorés, erreurs).

---

### `ExportAdmin.jsx` — Module d'exportation

Génération de rapports PDF à la volée pour les événements et leurs publications. Utilise la bibliothèque Apache PDFBox côté backend. Permet d'exporter les listes de publications, les statistiques de consultation et les données d'audit.

---

### `AuditAdmin.jsx` — Journaux d'audit de sécurité

Visualisation des logs de sécurité : connexions, modifications de données, tentatives d'accès refusées, uploads de fichiers. Chaque entrée contient l'horodatage, l'utilisateur, l'action effectuée et l'adresse IP. Filtrable par type d'action et par période.

---

### `LoginPage.jsx` — Page de connexion

Formulaire de connexion avec deux modes :

- **Authentification classique** : Email + mot de passe (JWT)
- **Authentification Google OAuth2** : Connexion en un clic via Google Identity Services

Redirige vers le tableau de bord après authentification réussie. Gère l'affichage des erreurs (identifiants invalides, compte désactivé).

---

### `RegisterPage.jsx` — Page d'inscription

Formulaire d'inscription pour les nouveaux utilisateurs. Collecte : nom, prénom, email, mot de passe, confirmation. Après inscription réussie, l'utilisateur est automatiquement connecté et redirigé.

---

### `ForgotPasswordPage.jsx` — Récupération de mot de passe

Formulaire de demande de réinitialisation de mot de passe. L'utilisateur saisit son adresse email et reçoit un lien de réinitialisation par email (si le compte existe).

---

### `ResetPasswordPage.jsx` — Réinitialisation du mot de passe

Formulaire de définition d'un nouveau mot de passe après clic sur le lien de réinitialisation reçu par email. Nécessite le token de réinitialisation (via l'URL) et la confirmation du nouveau mot de passe.

---

### `ProfilePage.jsx` — Page de profil utilisateur

Espace personnel du responsable d'événement. Contient :

- **Carte d'identité** : Photo de profil (modifiable), nom, email (lecture seule), badge de rôle
- **Statistiques** : Congrès gérés, E-Posters publiés, lectures totales
- **Informations personnelles** : Édition du prénom et du nom
- **Sécurité** : Changement de mot de passe (ancien + nouveau + confirmation)
- **Congrès assignés** : Liste en lecture seule des événements sous responsabilité (titre, dates, lieu, statut)

---

## Composants réutilisables — `src/components/`

### `DataTable.jsx` — Tableau de données générique

Composant de tableau configurable avec tri par colonnes, recherche intégrée et actions par ligne (éditer, supprimer, voir). Accepte une configuration de colonnes et de données via props.

---

### `Form.jsx` — Formulaire dynamique

Générateur de formulaires basé sur une configuration déclarative. Supporte les types de champs : text, textarea, select, file upload, date picker, number. Gère la validation côté client et l'affichage des erreurs.

---

### `LoadingState.jsx` — Indicateur de chargement

Composant d'état de chargement avec spinner animé et message personnalisable. Utilisé dans toutes les pages lors du fetch de données.

---

### `Pagination.jsx` — Composant de pagination

Navigation paginée avec affichage du nombre total de pages, boutons précédent/suivant et sélection directe de page. S'intègre avec le hook `usePagination`.

---

### `QRCodeGenerator.jsx` — Générateur de QR Code

Composant de rendu de QR codes utilisant la bibliothèque `qrcode.react`. Génère des QR codes adaptables avec l'URL dynamique du serveur (hostname + port courant) pour permettre le scan depuis un appareil mobile sur le même réseau.

---

### `totem/TotemLayout.jsx` — Layout du mode borne totem

Structure de mise en page pour l'interface Totem. Gère l'habillage visuel dynamique (couleurs, logo) en fonction de l'événement sélectionné, récupérés depuis la base de données via `useDynamicTheme`.

---

### `totem/TotemUI.jsx` — Interface tactile du totem

Ensemble de composants UI optimisés pour les grands écrans tactiles : grands boutons, zones de touche élargies, clavier virtuel intégré pour la recherche, défilement virtualisé pour maintenir 60 FPS sur de longues listes.

---

## Hooks personnalisés — `src/hooks/`

### `useCRUD.js` — Hook générique CRUD

Hook réutilisable qui encapsule les opérations CRUD avec React Query :

- `useList(page, size, filters)` — Récupère une liste paginée
- `useDetail(id)` — Récupère un élément unique
- `useCreate()` — Crée un nouvel élément (mutation)
- `useUpdate()` — Modifie un élément existant (mutation)
- `useDelete()` — Supprime un élément (soft delete)

Gère automatiquement l'invalidation du cache, les notifications toast et la gestion des erreurs.

---

### `useDynamicTheme.js` — Thématisation dynamique

Hook qui applique dynamiquement les variables de thème (couleurs primaires, secondaires, logo) récupérées depuis l'événement sélectionné. Modifie les variables CSS custom properties (`--primary-color`, etc.) pour adapter l'interface à l'identité visuelle de chaque congrès sans modifier le code source.

---

### `useIdleTimer.js` — Détection d'inactivité

Hook de minuterie d'inactivité pour le mode borne totem. Après une période configurable sans interaction utilisateur (touch ou souris), déclenche un callback (retour à l'écran d'accueil, lancement du diaporama). Essentiel pour les bornes en libre-service dans les lieux publics.

---

### `usePagination.js` — Gestion de pagination

Hook de gestion de l'état de pagination (page courante, taille de page, total d'éléments). Calcule le nombre de pages et fournit les handlers de navigation (suivant, précédent, aller à la page N).

---

### `useTotemApi.js` — Appels API pour le totem

Hook spécialisé pour les appels API du mode Totem. Utilise l'instance `publicApi` (sans authentification) pour récupérer les événements, publications et détails. Gère le cache et le rechargement automatique.

---

## Utilitaires — `src/lib/`

### `cn.js` — Concaténation de classes CSS

Fonction utilitaire basée sur `clsx` / `tailwind-merge` pour combiner conditionnellement des classes CSS Tailwind sans conflits. Utilisée dans tous les composants pour le stylisage conditionnel.

---

## Schémas — `src/schemas/`

### `forms.ts` — Définitions des formulaires

Schémas TypeScript décrivant la structure et la validation des formulaires de l'application (événements, publications, auteurs, catégories). Utilisés pour la génération dynamique de formulaires et la validation côté client.

---

## State Management — `src/stores/`

### `authStore.js` — Store d'authentification (Zustand)

Store global de gestion de l'authentification utilisateur. Persiste dans le `localStorage` :

- **Token JWT** pour les requêtes API authentifiées
- **Nom d'utilisateur** et **rôle** (ROLE_ADMIN ou ROLE_EVENT_MANAGER)
- **Profil étendu** : prénom, nom, URL de l'avatar

Exposes les actions :

- `login(username, password)` — Connexion classique
- `loginWithGoogle(credential)` — Connexion via Google OAuth2
- `registerUser(payload)` — Inscription d'un nouvel utilisateur
- `loadProfile()` — Chargement du profil depuis le serveur
- `updateProfile(body)` — Mise à jour du profil (nom, avatar, mot de passe)
- `logout()` — Déconnexion et nettoyage du stockage local

---

### `totemStore.js` — Store du mode Totem (Zustand)

Store global pour le mode borne totem. Persiste dans le `localStorage` (via `zustand/persist`) :

- **Événement sélectionné** (`selectedEventId`)
- **Catégorie filtrée** (`selectedCategory`)
- **Recherche en cours** (`searchQuery`)
- **Identifiant d'écran** (`screenId`) pour le mode multi-borne
- **Historique de navigation** (`viewHistory`) — 100 dernières publications consultées

Exposes les actions de mise à jour et de réinitialisation de l'état de navigation.

---

## Front-Office (Totem) — `src/totem/`

### `TotemHome.jsx` — Accueil du mode totem

Page d'accueil de l'interface borne tactile. Affiche la liste des événements actifs sous forme de cartes interactives. L'utilisateur sélectionne un congrès pour accéder à ses publications. Intègre le logo dynamique de l'événement et la thématisation adaptative.

---

### `TotemEventsDisplay.jsx` — Affichage des événements

Composant de présentation détaillée des événements. Affiche les métadonnées (titre, description, dates, lieu) et les QR codes pour le programme et la revue de chaque événement. Permet la navigation vers les publications associées.

---

### `TotemPublications.jsx` — Liste des publications

Page de consultation des E-Posters pour un événement donné. Affiche :

- Barre de recherche full-text
- Filtres par catégorie et par auteur
- Grille de cartes de publications avec aperçu miniature
- QR code unique par publication pour l'accès mobile
- Défilement virtualisé pour les grandes listes (optimisation 60 FPS)

---

### `TotemPosterDetail.jsx` — Détail d'un E-Poster

Page de consultation détaillée d'une publication scientifique. Affiche :

- Le poster en plein écran (image HD ou PDF avec zoom)
- Titre, auteurs, catégorie, événement
- Abstract complet
- QR code pour partage mobile
- Bouton de retour à la liste

---

### `TotemSlideshow.jsx` — Mode diaporama

Mode de diffusion automatique des publications sur les bornes totem. Fait défiler les posters à intervalle configurable avec des transitions fluides. Idéal pour l'affichage passif dans les halls de congrès entre les sessions.

---

### `totemSync.js` — Synchronisation multi-écrans

Module de synchronisation pour le déploiement multi-borne. Permet de coordonner l'affichage entre plusieurs écrans totem physiques via des appels API périodiques (polling). Chaque écran peut afficher un événement ou une catégorie différente tout en restant synchronisé avec les données serveur.

---

## Fichier de test — `public/assets/`

### `import_test.csv`

Fichier CSV d'exemple utilisé pour tester le module d'importation de masse. Contient quelques lignes de publications scientifiques fictives avec les colonnes attendues (titre, auteurs, abstract, catégorie).
