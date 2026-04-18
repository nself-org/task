# Backend Architecture

The ɳTasks backend is a self-contained Docker Compose stack. It runs PostgreSQL 16, Hasura GraphQL Engine, Hasura Auth, Hasura Storage over MinIO, Mailpit (dev email), and Traefik (HTTPS for staging and production).

## Why Docker Compose, Not the nSelf CLI

`task/` is the "any-stack" reference app. Other Type C apps in the nSelf ecosystem (`chat`, `claw`, `ntv`) use the `nself` CLI; this repo demonstrates the same Postgres + Hasura + Auth pattern as plain Docker Compose so a developer can fork, study, or operate the components directly.

The other reference apps cover the `nself start` flow. `task/` covers the manual flow.

## Service Diagram

```
+------------------------------------------------------------+
|              ɳTasks Flutter App (app/)                     |
|         GraphQL over HTTP/WS to Hasura endpoint            |
+----------------------------+-------------------------------+
                             |
                             v
+------------------------------------------------------------+
|       Backend Docker Compose stack (backend/)              |
|                                                            |
|  +---------+  +-------+  +----------+  +----------------+  |
|  | Hasura  |  | Auth  |  | Storage  |  | Mailpit (dev)  |  |
|  | GraphQL |  | (JWT) |  | (S3 API) |  +----------------+  |
|  | (8080)  |  | (4000)|  | (8484)   |                      |
|  +----+----+  +---+---+  +----+-----+                      |
|       |           |           |                            |
|       |           v           v                            |
|       |     +---------------------+                        |
|       |     |  PostgreSQL 16      |                        |
|       +---->|  schemas: auth,     |                        |
|             |  storage, public    |                        |
|             +---------------------+                        |
|                                                            |
|       +-----------------+                                  |
|       |  MinIO (9000)   | <- backs Hasura Storage          |
|       +-----------------+                                  |
|                                                            |
|       +-----------------+                                  |
|       | Traefik (80/443)| (staging/prod profiles)          |
|       +-----------------+                                  |
+------------------------------------------------------------+
```

## Services

| Service | Image | Default port | Purpose |
|---------|-------|--------------|---------|
| postgres | `postgres:16` | 5432 | Database |
| graphql-engine | `hasura/graphql-engine` | 8080 | GraphQL API + console |
| auth | `nhost/hasura-auth` | 4000 | JWT signup, signin, password reset |
| storage | `nhost/hasura-storage` | 8484 | S3-compatible upload, download, signed URLs |
| minio | `minio/minio` | 9000, 9001 | Object storage backend + admin UI |
| mailpit | `axllent/mailpit` | 8025 | Dev email capture (UI on 8025, SMTP on 1025) |
| traefik | `traefik` | 80, 443 | HTTPS reverse proxy (staging/prod profiles) |

## Compose Files

| File | Purpose |
|------|---------|
| `backend/docker-compose.yml` | Local dev (the `--profile dev` set is started by `make up`) |
| `backend/docker-compose.staging.yml` | Staging overlay (Traefik HTTPS) |
| `backend/docker-compose.production.yml` | Production overlay (HTTPS, backups, resource limits) |
| `backend/docker-compose.app.yml` | Optional app overlay (containerized app) |
| `backend/docker-compose.override.yml` | Local override layer |

The Makefile chains the right files for you:

```bash
cd backend && make up           # local dev
cd backend && make staging-up   # staging
cd backend && make prod-up      # production
```

## Data Flow (Typical Request)

1. The Flutter app reads its JWT from secure storage.
2. The app sends a GraphQL query, mutation, or subscription to `http://localhost:8080/v1/graphql` (dev) or the equivalent staging/prod URL.
3. Hasura validates the JWT against `HASURA_GRAPHQL_JWT_SECRET`, applies row-level permissions, and queries Postgres.
4. For file uploads, the app calls `storage` (port 8484), which writes to MinIO.
5. For auth flows, the app calls `auth` (port 4000), which writes to the Postgres `auth` schema.
6. Outbound emails go to Mailpit in dev (UI at `http://localhost:8025`); staging/prod uses real SMTP.

## Database Schema

Three application schemas plus Hasura/Auth/Storage system schemas:

- `auth` schema: managed by `hasura-auth` (users, refresh tokens, providers)
- `storage` schema: managed by `hasura-storage` (files, virus scan state)
- `public` schema: ɳTasks application tables (lists, todos, shares, presence, attachments)

See [Database Schema](Database-Schema) for table-level detail.

## Environments

| Environment | Compose chain | Trigger | TLS |
|-------------|---------------|---------|-----|
| Local | `docker-compose.yml` | `make up` | None (HTTP localhost) |
| Staging | `docker-compose.yml + docker-compose.staging.yml` | `make staging-up` | Traefik + Let's Encrypt |
| Production | `docker-compose.yml + docker-compose.production.yml` | `make prod-up` | Traefik + Let's Encrypt + backups + resource limits |

The hosted free demo at `task.nself.org` runs the same stack via `web/backend`.

## Plugin Set

`task/` is free-plugins-only by design (per F03, F12). It does not install nSelf pro plugins (ai, claw, mux, livekit, etc.). The free capabilities relevant to this app live in:

- `plugins/storage` (covered by Hasura Storage + MinIO directly here)
- `plugins/auth` (covered by `hasura-auth` directly here)

For the full free plugin inventory, see [F03-PLUGIN-INVENTORY-FREE](https://github.com/nself-org/cli/wiki) in the cli wiki.

## App ↔ Backend Connection

The Flutter app picks its endpoint at build time:

| Build target | Default endpoint |
|--------------|------------------|
| Web | `http://localhost:8080/v1/graphql` |
| macOS / Linux / Windows desktop | `http://localhost:8080/v1/graphql` |
| iOS / Android (simulator/emulator) | host machine IP at `:8080` (configurable) |

Override via the app's environment configuration. See [Backend Setup](Backend-Setup) for the full env var reference.

## Related

- [Backend Setup](Backend-Setup): operator setup walkthrough
- [Database Schema](Database-Schema): schema reference
- [Deployment](Deployment): staging and production deploy
- [Features](Features): full app feature inventory
- [Home](Home): wiki home
