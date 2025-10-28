# Acquisitions - Project Overview

## 📋 Project Description
A Node.js/Express application with Neon Database integration, featuring authentication, user management, and security middleware. The application is fully dockerized with separate configurations for development (using Neon Local) and production (using Neon Cloud).

## 🏗️ Tech Stack
- **Runtime**: Node.js 22 (Alpine)
- **Framework**: Express 5.1.0
- **Database**: Neon PostgreSQL (via @neondatabase/serverless)
- **ORM**: Drizzle ORM 0.44.6
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Security**: 
  - Arcjet (@arcjet/node)
  - Helmet
  - CORS
- **Logging**: Winston + Morgan
- **Validation**: Zod 4.1.12
- **Containerization**: Docker + Docker Compose

## 📁 Project Structure
```
acquisitions/
├── src/
│   ├── config/          # Configuration files (database, logger, arcjet)
│   ├── controllers/     # Request handlers (auth, users)
│   ├── middleware/      # Security and custom middleware
│   ├── models/          # Database models (user.model.js)
│   ├── routes/          # API routes (auth, users)
│   ├── services/        # Business logic (auth, users)
│   ├── utils/           # Utilities (jwt, cookies, format)
│   ├── validations/     # Zod validation schemas
│   ├── app.js           # Express app setup
│   ├── server.js        # Server initialization
│   └── index.js         # Entry point
├── drizzle/             # Database migrations
├── scripts/             # Helper scripts (dev.sh, prod.sh)
├── logs/                # Application logs
├── .neon_local/         # Neon Local branch data
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.dev.yml   # Dev environment with Neon Local
├── docker-compose.prod.yml  # Production environment
└── drizzle.config.js    # Drizzle ORM configuration
```

## 🚀 Available Scripts

### Development
- `npm run dev` - Start dev server with hot reload (node --watch)
- `npm run dev:docker` - Run dev environment via Docker Compose (./scripts/dev.sh)

### Production
- `npm start` - Start production server
- `npm run prod:docker` - Run production environment via Docker (./scripts/prod.sh)

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## 🐳 Docker Setup

### Development Environment
Uses Neon Local for ephemeral database branches:

```bash
# Set required environment variables
export NEON_API_KEY={{NEON_API_KEY}}
export NEON_PROJECT_ID={{NEON_PROJECT_ID}}
export PARENT_BRANCH_ID={{PARENT_BRANCH_ID}}

# Start development stack
docker compose -f docker-compose.dev.yml up --build

# Run migrations
docker compose -f docker-compose.dev.yml run --rm app npm run db:migrate
```

**Services**:
- App: http://localhost:3000
- Health: http://localhost:3000/health
- Neon Local Postgres: localhost:5432

### Production Environment
Connects to Neon Cloud database:

```bash
# Configure DATABASE_URL in .env.production
# Format: postgresql://<user>:<password>@<endpoint>.neon.tech/<db>?sslmode=require

# Start production stack
docker compose -f docker-compose.prod.yml up --build -d

# Run migrations
docker compose -f docker-compose.prod.yml run --rm app npm run db:migrate
```

## 🔒 Environment Variables

### Development (.env.development)
- `DATABASE_URL` - Points to Neon Local: `postgres://local:local@neon-local:5432/neondb`
- `NEON_API_KEY` - Neon API key (injected from host)
- `NEON_PROJECT_ID` - Neon project ID
- `PARENT_BRANCH_ID` - Parent branch for ephemeral branches
- `PORT` - Application port (default: 3000)

### Production (.env.production)
- `DATABASE_URL` - Neon Cloud connection string with SSL
- `PORT` - Application port
- Additional production-specific configs

## 🔑 Key Features
1. **Multi-stage Docker builds** - Optimized for both dev and prod
2. **Ephemeral database branches** - Development uses Neon Local for isolated testing
3. **Hot reload** - Development environment supports live code updates
4. **Path aliases** - Clean imports using `#config/*`, `#controllers/*`, etc.
5. **Security-first** - Helmet, CORS, Arcjet, JWT authentication
6. **Structured logging** - Winston for application logs, Morgan for HTTP logs
7. **Type-safe validation** - Zod schemas for request validation
8. **Health checks** - Built-in health endpoints for container orchestration

## 🌐 API Endpoints

### Authentication
- Defined in `src/routes/auth.routes.js`
- Handlers in `src/controllers/auth.controller.js`
- Services in `src/services/auth.service.js`

### Users
- Defined in `src/routes/users.routes.js`
- Handlers in `src/controllers/users.controller.js`
- Services in `src/services/users.services.js`

## 🛠️ Development Workflow

1. **Local development** (no Docker):
   ```bash
   npm install
   npm run dev
   ```

2. **Dockerized development**:
   ```bash
   npm run dev:docker
   # or
   sh ./scripts/dev.sh
   ```

3. **Making changes**:
   - Edit files in `src/`
   - Changes are hot-reloaded in Docker dev environment
   - Run `npm run lint` before committing

4. **Database changes**:
   - Modify models in `src/models/`
   - Generate migration: `npm run db:generate`
   - Apply migration: `npm run db:migrate`

## 📦 Docker Images

The `Dockerfile` creates optimized multi-stage builds:

1. **base** - Base Node.js 22 Alpine image with package.json
2. **deps-dev** - Development dependencies
3. **deps-prod** - Production dependencies only
4. **development** - Dev image with hot reload
5. **production** - Optimized production image with health checks

## 📝 Notes
- `.dockerignore` prevents `.env*` files from being copied into images
- Environment variables are injected at runtime via Docker Compose
- Supports both Neon serverless driver and standard Postgres connections
- Git branch tracking with Neon Local for branch-per-feature workflow
- Healthchecks included for container orchestration (Kubernetes, ECS, etc.)

## 🔗 Resources
- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)
