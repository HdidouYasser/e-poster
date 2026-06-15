# E-Poster Platform

Plateforme de gestion et d'affichage interactif de communications scientifiques (E-Posters) pour les congrès médicaux et académiques, déployée sur des bornes tactiles interactives (totems événementiels).

---

## À propos du projet

Ce projet a été développé dans le cadre d'un stage technique effectué au sein de **DevPub Solution**, une agence spécialisée dans les solutions interactives événementielles. Il porte sur la **refonte dynamique complète** de la plateforme E-Poster existante, initialement construite sur une architecture legacy PHP/MySQL. L'objectif principal était de moderniser l'ensemble de la stack technique en migrant vers une architecture moderne, scalable et maintenable, capable de supporter les exigences de performance et de sécurité d'un environnement professionnel.

### Contexte et problématique

La plateforme originale souffrait de plusieurs limitations critiques : une architecture monolithique rigide, des performances dégradées sur les grandes listes de publications, l'absence de gestion multi-écrans, aucune compatibilité mobile, et un système d'authentification basique ne permettant pas le cloisonnement des rôles. Ces contraintes empêchaient le déploiement de la solution lors de congrès d'envergure nécessitant plusieurs bornes tactiles fonctionnant simultanément.

### Solution implémentée

La nouvelle plateforme a été intégralement reconçue selon une **architecture full-stack moderne** et une méthodologie de développement agile (Scrum/Kanban).

**Back-end** — Développé en **Java 17** et **Spring Boot 3**, le serveur expose une API REST sécurisée organisée en couches strictes (Controller → Facade → Service → Repository). La persistance des données est assurée par **Spring Data JPA** avec **Hibernate** comme ORM, connecté à une base **MySQL 8+** normalisée en 3NF avec indexation FULLTEXT pour la recherche multicritère. La sécurité applicative repose sur **Spring Security** avec filtrage JWT et contrôle d'accès basé sur les rôles (RBAC). L'authentification déléguée via **OAuth2** (Google Identity Services) permet aux responsables d'événements de se connecter sans mot de passe local.

**Front-end** — Application **Single Page Application (SPA)** construite avec **React 18** et **Vite**, stylisée avec **Tailwind CSS**, et structurée autour de composants fonctionnels réutilisables. La gestion d'état est centralisée via **Zustand** (stores d'authentification et de navigation Totem), tandis que la récupération de données asynchrone utilise **TanStack Query** (React Query) avec cache intelligent et invalidation automatique.

**Base de données** — **MySQL 8+** avec schéma relationnel modélisé sous MySQL Workbench (diagramme EER). Les entités principales incluent : Events, Publications, Authors, Categories, Screens, Users, Roles, et AuditLogs. La suppression logique (soft delete via colonne `deleted_at`) garantit l'intégrité historique des données.

### Fonctionnalités principales

- **Mode Totem (interface publique)** — Interface optimisée pour les écrans tactiles grand format avec défilement virtualisé (60 FPS), grands éléments interactifs, recherche full-text, et navigation par catégories médicales (Cardiologie, Neurologie, Chirurgie, Pédiatrie, etc.).
- **Back-office d'administration** — Tableau de bord avec statistiques en temps réel, gestion CRUD complète des événements, publications, auteurs, catégories, responsables et écrans.
- **Authentification sécurisée** — JWT + OAuth2 (Google) avec trois niveaux d'accès : Administrateur (privilèges complets), Responsable d'événement (consultation de ses congrès assignés), Visiteur (accès public).
- **Multi-écrans synchronisé** — Gestion indépendante de plusieurs bornes totem physiques avec affectation spécifique des publications par écran et synchronisation en temps réel.
- **Accès mobile par QR Code** — Chaque publication dispose d'un QR code unique avec résolution d'URL adaptative permettant aux participants de consulter les posters sur leur smartphone.
- **Importation de masse** — Moteur de traitement asynchrone pour l'import de centaines de publications depuis des fichiers CSV/Excel, avec parsing multi-auteurs et détection de doublons.
- **Exportation PDF** — Génération dynamique de rapports via Apache PDFBox.
- **Thématisation dynamique** — Adaptation automatique de l'interface (couleurs, logo, branding) à l'identité visuelle de chaque événement.
- **Mode diaporama** — Diffusion automatique des publications pour l'affichage passif entre les sessions interactives.
- **Audit de sécurité** — Journalisation complète des actions (connexions, modifications, uploads) avec horodatage et adresse IP.

---

## Architecture technique

```
e-poster/
├── backend/          → API REST Java (Spring Boot 3)
│   ├── src/main/java → Code source (controllers, services, repositories)
│   ├── src/main/resources → Configuration (application.yml)
│   ├── uploads/      → Fichiers uploadés (médias, posters)
│   └── pom.xml       → Dépendances Maven
│
├── frontend/         → Application React 18 (Vite + Tailwind CSS)
│   ├── src/admin/    → Back-office (15 pages)
│   ├── src/totem/    → Front-office Totem (6 pages)
│   ├── src/components/ → Composants UI réutilisables
│   ├── src/hooks/    → Hooks personnalisés (CRUD, theme, idle timer)
│   ├── src/stores/   → State management Zustand
│   └── src/api.js    → Client HTTP Axios
│
├── migration/        → Scripts Node.js de migration de données
│
└── docs/             → Documentation technique (diagrammes UML, GANTT)
```

---

## Stack technologique

| Couche | Technologies |
|--------|-------------|
| **Back-end** | Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate |
| **Front-end** | React 18, Vite, Tailwind CSS, Zustand, TanStack Query, Axios |
| **Base de données** | MySQL 8+, indexation FULLTEXT, diagramme EER |
| **Authentification** | JWT, OAuth2 (Google Identity Services), BCrypt |
| **Modélisation** | Mermaid (diagram-as-code), MySQL Workbench (EER) |
| **Gestion de projet** | Trello (Kanban), Git, GitHub |
| **IDE** | IntelliJ IDEA (back-end), VS Code (front-end) |
| **Tests API** | Postman |

---

## Installation et démarrage

### Prérequis

- **Java 17+**
- **Node.js 18+**
- **MySQL 8.0+**
- **Maven** (ou `mvnd` pour un build accéléré)

### 1. Configuration de la base de données

Créez une base de données MySQL nommée `eposter` :

```sql
CREATE DATABASE eposter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Le backend se connecte avec les identifiants définis dans `backend/src/main/resources/application.yml` (ou via les variables d'environnement `MYSQL_USER` / `MYSQL_PASSWORD`).

### 2. Démarrage du Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Le serveur API démarrera sur `http://localhost:8080`.

### 3. Démarrage du Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

### 4. Accès administrateur

- URL : `http://localhost:5173/login`
- Identifiants par défaut : `admin` / `admin123`

### 5. Variables d'environnement

Créez un fichier `frontend/.env` :

```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=votre-google-client-id.apps.googleusercontent.com
```

---

## Rôles et permissions

| Rôle | Accès |
|------|-------|
| **Administrateur** | Dashboard complet, CRUD total (événements, publications, auteurs, catégories, responsables, écrans), import/export, audit logs |
| **Responsable d'événement** | Consultation des événements assignés, profil personnel (édition nom/prénom, changement mot de passe, upload avatar) |
| **Visiteur** | Interface publique Totem, recherche de publications, consultation des posters, scan QR code mobile |

---

## Équipe

Projet développé en binôme dans le cadre d'un stage Bachelor :

- **Hdidou Yasser** — Co-développeur
- **Machhour Aymane** — Co-développeur

Stage encadré par **DevPub Solution** — Année universitaire 2025-2026.
