# E-Poster MVP (Phase 3 Core)

## Structure

- `backend`: Spring Boot + MySQL (XAMPP) + JWT + CRUD events/publications + recherche FULLTEXT.
- `frontend`: React (Vite) + React Router + Axios + Zustand + React Query.
- `migration`: script Node.js de migration MySQL -> MongoDB + GridFS.

## Lancement

### Backend

1. Installer Java 17 et Maven.
2. Démarrer MySQL via XAMPP, puis créer une base `eposter`.
3. Configurer les variables si besoin:
   - `MYSQL_HOST` (défaut `localhost`)
   - `MYSQL_PORT` (défaut `3306`)
   - `MYSQL_DATABASE` (défaut `eposter`)
   - `MYSQL_USER` (défaut `root`)
   - `MYSQL_PASSWORD`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. Lancer:

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Migration (semaine 7)

Voir `migration/README.md`.

## Endpoints principaux

- `POST /api/auth/login`
- `GET /api/events`, `POST /api/events`, `PUT /api/events/{id}`, `DELETE /api/events/{id}`
- `GET /api/events/search?q=...`
- `GET /api/publications`, `POST /api/publications`, `PUT /api/publications/{id}`, `DELETE /api/publications/{id}`
- `GET /api/publications/search?q=...`

Swagger disponible sur `/swagger-ui/index.html`.
