# 🍔 Food Order API

A modern, modular Fastify API built for managing food ordering workflows.  
Includes strong type-safe schema validation, centralized logging, health checks, and structured architecture using the Dependency Inversion principle.

---

## ✨ Features

- 🔥 Fastify v5 with modular plugin structure
- ✅ JSON Schema-based validation via `ajv-oai`
- 🧪 Testing with `tap` and coverage via `c8`
- 📦 PostgreSQL support via `pg`
- 🪵 Logging via `pino` and `pino-pretty`
- 🧱 Domain-first architecture (Domain → Service → Controller)
- 🧼 Pre-commit checks with Husky, Lint-Staged, ESLint, and Prettier
- 🩺 Health check endpoint with `fastify-healthcheck`

[//]: # (TODO review this)

---

## 📦 Requirements

- Node.js ≥ 18
- PostgreSQL
- `DATABASE_URL` environment variable (see `.env.example` or setup instructions below)

[//]: # (TODO check env variable setup)

---

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Local Environment Variables

Create a .env file using .env.example or export variables manually: 

```bash
DATABASE_URL=postgres://<USERNAME>:<PASSWORD>@localhost:5432/testdb
```

### 3. Run Prepare Script

Runs "husky" command to ensure git hooks are active

```bash
npm run prepare
```

---

## Run Database Locally

The local database is used for local development and for integration tests

Consists of a postgres database built using docker-compose.yml
Volume is initialised with test data via init.sql and includes a persistent volume

### start database

```bash
npm run db:start
```

### stop database

```bash
npm run db:stop
```

### Or via docker-compose CLI

run in detached mode
- ```docker-compose up -d```

list volumes
- ```docker volume ls```

inspect volume
- ```docker volume inspect food-order-api_postgres-data```

stop database
- ```docker-compose down```

stop database and remove volume
- ```docker-compose down -v```

access database via psql CLI
- ```psql -h localhost -U testuser -d testdb```

---

## 🧪 Running Tests

### Run all tests

```bash
npm test
```

### Run unit tests

```bash
npm run test:unit
```

### Report mode 

Applies to unit tests

```bash
npm run test:report
```

### Run integration tests

```bash
npm run test:integration
```

### Running an individual test

```bash
tap test/unit/repositories/ingredient-repository.test.js
```

Coverage thresholds are defined under c8 in package.json.

---

## 🧼 Linting and Formatting

### Run linter

```bash
npm run lint
```

### Auto-fix lint errors:

```bash
npm run lint:fix
```

---

## 🪝 Git hooks
This project uses Husky for Git hooks.

### Pre-commit checks

- uses lint-staged to run "eslint --fix" on staged files
- See .husky/pre-commit

### Pre-push checks

- Runs "npm run test" prior to push
- See .husky/pre-commit

To skip verification use the "--no-verify" flag
```bash
git push --no-verify
```

### Setup (if required)
```bash
npx husky init
```

---

## 📐 Generate API Schema

To re-generate schema from OpenAPI spec:

```bash
npm run generate:schema
```

See: scripts/generate-schema.js.

---

## 🚀 Run Server

### Start server in production mode
- log level info
- log redaction active
- structured logs

```bash
npm run start
```
### Start server in local mode
- log level debug
- log redaction off
- pino-pretty logs
- run with nodemon

```bash
npm run start:dev
```

---

## 📖 Project Structure

```bash
src/
├── app.js                     # Fastify app setup
├── server.js                  # App entrypoint
├── config/                    # Config files
├── controllers/               # Route handlers
├── domain/                    # Domain models
├── hooks/                     # Fastify lifecycle hooks
├── infrastructure/            # External integrations (e.g., DB)
├── lib/                       # Utility functions
├── repositories/              # DB access logic
├── routes/                    # Route registration
├── schemas/                   # Schemas
├── services/                  # Business logic
test/                          # Tests
├── unit/                      # Unit tests
├── integration/               # Integration tests
scripts/                       # Scripts (e.g., schema generator)
api-spec.yaml                  # OAS 3.1.0 
```

---

## 🩺 Health Check

The API exposes a health check endpoint:

```text
GET /<app-name>/api/<version>/health/check
```

Useful for container orchestration platforms (e.g., Docker, Kubernetes).

---

## 🧱 Architectural Overview

This project adheres to the Dependency Inversion Principle, organizing code using concepts inspired by Onion 
Architecture, with clear separation between domain, application, and infrastructure layers.

- Controllers receive requests and delegate to services
- Services perform logic and use repositories
- Repositories interact with the database
- Domain encapsulates business rules and entities
- Everything is injected via factory functions for testability.

---

