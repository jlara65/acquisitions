# Dockerized app with Neon Database (Local dev via Neon Local, Production via Neon Cloud)

This repository is dockerized for two environments:
- Development: runs your app + Neon Local proxy (ephemeral branches) via Docker Compose
- Production: runs only your app; connects to Neon Cloud using a DATABASE_URL

## Files added
- `Dockerfile` – multi-stage build for dev and prod
- `docker-compose.dev.yml` – app + Neon Local for local development
- `docker-compose.prod.yml` – app only; uses Neon Cloud DATABASE_URL
- `.env.development` – local dev env (DATABASE_URL points to Neon Local)
- `.env.production` – production env (placeholder Neon Cloud DATABASE_URL)
- `.dockerignore` – excludes node_modules, VCS, and env files from images

## Requirements
- Docker and Docker Compose
- Neon account and a project
- These secrets from Neon for dev with Neon Local (do not commit them):
  - `NEON_API_KEY`
  - `NEON_PROJECT_ID`
  - `PARENT_BRANCH_ID` (ID of the branch you want ephemeral branches to be created from, e.g. your main branch)

Learn more: https://neon.com/docs/local/neon-local

## How environment switching works
- Development uses `.env.development` with `DATABASE_URL=postgres://local:local@neon-local:5432/neondb` (the host `neon-local` is the Neon Local container name on the compose network).
- Production uses `.env.production` with `DATABASE_URL=postgresql://...neon.tech/...` and `sslmode=require`.
- No secrets are hardcoded; Compose injects envs from files and the host environment.

## Local development (Neon Local + ephemeral branches)
1) Set your Neon secrets in your shell (or a local shell-only file you don’t commit):
   export NEON_API_KEY={{NEON_API_KEY}}
   export NEON_PROJECT_ID={{NEON_PROJECT_ID}}
   export PARENT_BRANCH_ID={{PARENT_BRANCH_ID}}

2) Adjust `.env.development` if your default DB name is not `neondb`.

3) Start dev stack:
   docker compose -f docker-compose.dev.yml up --build

- App: http://localhost:3000
- Health: http://localhost:3000/health
- Neon Local exposes Postgres on `localhost:5432` (and `neon-local:5432` inside the compose network).
- An ephemeral branch is created when the Neon Local container starts and deleted when it stops.

Run migrations (optional):
   docker compose -f docker-compose.dev.yml run --rm app npm run db:migrate

## Production (Neon Cloud)
1) Set `DATABASE_URL` in `.env.production` to the Neon Cloud URL (from the Neon console), e.g.:
   postgresql://<user>:<password>@<endpoint>.neon.tech/<db>?sslmode=require

2) Start the app (no Neon Local in prod):
   docker compose -f docker-compose.prod.yml up --build -d

3) Run migrations (optional):
   docker compose -f docker-compose.prod.yml run --rm app npm run db:migrate

## Notes
- The Dockerfile builds two images: a dev image (hot reload via `npm run dev`) and a prod image (`node src/index.js`).
- `.dockerignore` prevents `.env*` from being copied into images; envs are provided at runtime via Compose.
- This setup supports both the Neon serverless driver and standard Postgres connections via Neon Local.
