# Contributing to ɳTasks

## What This Is

ɳTasks is an open-source task management app. It uses Docker Compose directly for its backend (the "any-stack" reference — showing nSelf-style architecture without requiring the nSelf CLI).

## Prerequisites

- Node.js 22+
- pnpm 9+
- Docker

## Setup

```bash
git clone https://github.com/nself-org/ntask
cd task
```

## Backend

```bash
cd .backend
make up     # starts backend (PostgreSQL, Hasura, Auth)
make down   # stops backend
```

## Frontend

```bash
pnpm install
pnpm dev
```

## Pull Requests

1. Fork and create a branch
2. `pnpm lint` and `pnpm typecheck` must pass
3. Submit PR against `main`

## Commit Style

Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`
