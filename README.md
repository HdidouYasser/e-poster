# E-Poster Platform

Plateforme de gestion et d'affichage interactif de posters électroniques (e-posters) pour événements scientifiques et académiques.

## Architecture

Le projet est divisé en trois parties principales :
- **Backend** : API REST développée en Java avec Spring Boot, sécurité JWT, base de données MySQL et recherche full-text.
- **Frontend** : Application React 18 propulsée par Vite, avec Tailwind CSS pour un design premium, Zustand pour la gestion d'état et React Query pour la récupération de données.
- **Migration** : Script Node.js pour importer de la donnée existante.

## Fonctionnalités Principales

- **Mode Totem (Public)** : Interface grand format, tactile et réactive avec mode sombre, adaptée pour des écrans haute résolution.
- **Administration** : Back-office complet pour la gestion des événements, écrans et publications.
- **Recherche Avancée** : Moteur de recherche rapide optimisé via des index FULLTEXT MySQL.
- **Multi-écrans** : Gestion synchronisée permettant à l'écran 2 de suivre automatiquement la navigation de l'écran 1.
- **Upload de Fichiers** : Téléversement et gestion native des affiches et documents associés.

## Installation & Démarrage

### Prérequis
- Java 17+
- Node.js 18+
- MySQL 8.0+

### 1. Configuration de la base de données
Créez une base de données MySQL nommée `eposter`.
Le backend se connecte par défaut avec l'utilisateur défini dans `application.yml` (ou via les variables d'environnement `MYSQL_USER` / `MYSQL_PASSWORD`).

### 2. Démarrage du Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
# ou avec mvnd
mvnd spring-boot:run
```
Le serveur démarrera sur `http://localhost:8080`.

### 3. Démarrage du Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.
L'accès administrateur se fait sur `/login` (admin / admin123).

---
*Projet réalisé dans le cadre d'un stage Bachelor.*
