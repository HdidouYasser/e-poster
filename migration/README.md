# Migration PHP/MySQL -> MongoDB (E-Poster)

## Pré-requis

- Node.js 18+
- Accès MySQL (ancienne base)
- Accès MongoDB (nouvelle base)
- Un export local des fichiers (images/PDF) de l’ancienne plateforme

## Setup

```bash
cd migration
npm install
copy .env.example .env
```

Renseignez `.env`.

## Lancer

```bash
npm run migrate
```

## Ce que le script fait

- Lit des tables MySQL (à adapter aux noms réels)
- Normalise les champs (trim, valeurs nulles, dates)
- Insère dans MongoDB:
  - `events`
  - `publications`
- Migrer les fichiers vers GridFS et remplit `posterUrl` avec `/api/files/{id}`

## À adapter (important)

Les noms de tables/champs MySQL varient selon votre ancienne plateforme.
Les mappings sont centralisés dans `src/mapping.js`.

