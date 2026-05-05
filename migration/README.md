# Migration legacy MySQL -> cible MySQL (E-Poster)

## Pré-requis

- Node.js 18+
- Accès MySQL legacy (ancienne base)
- Accès MySQL cible (base du nouveau projet)

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

## Variables d'environnement

Le script lit depuis la base legacy et écrit dans la base cible:

- `LEGACY_MYSQL_HOST`
- `LEGACY_MYSQL_PORT`
- `LEGACY_MYSQL_USER`
- `LEGACY_MYSQL_PASSWORD`
- `LEGACY_MYSQL_DATABASE`
- `TARGET_MYSQL_HOST`
- `TARGET_MYSQL_PORT`
- `TARGET_MYSQL_USER`
- `TARGET_MYSQL_PASSWORD`
- `TARGET_MYSQL_DATABASE`
- `DRY_RUN` (`true`/`false`)

## Ce que le script fait

- Lit des tables legacy MySQL (à adapter aux noms réels)
- Normalise les champs (trim, valeurs nulles, dates)
- Insère dans MySQL cible:
  - `events`
  - `publications`
- Conserve `poster_url`/`file_path` dans `posterUrl` (pas de GridFS)

## À adapter (important)

Les noms de tables/champs MySQL varient selon votre ancienne plateforme.
Les mappings sont centralisés dans `src/mapping.js`.

