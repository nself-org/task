# ɳTasks

Self-hosted task management reference app. Flutter client over a Postgres + Hasura + Auth backend.

The "any-stack" reference app in the nSelf ecosystem: backend runs on raw Docker Compose, not the nSelf CLI.

[![Version](https://img.shields.io/badge/version-1.0.9%2B1-blue.svg)](https://github.com/nself-org/ntask/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build](https://github.com/nself-org/ntask/actions/workflows/test.yml/badge.svg)](https://github.com/nself-org/ntask/actions/workflows/test.yml)
<!-- VERSION_BADGE -->

## Description

**ɳTasks** is the "any-stack" reference app in the nSelf ecosystem. The Flutter client connects to a self-hosted backend running PostgreSQL 16, Hasura GraphQL Engine, Hasura Auth, Hasura Storage, and MinIO, all orchestrated as plain Docker Compose under `backend/`.

Unlike the other Type C reference apps (`chat`, `claw`, `ntv`) that use the nSelf CLI, `task/` ships its backend as raw `docker compose` so developers can fork, study, or operate the components without depending on the CLI. Use it as a starting point for your own self-hosted task tracker, or as a learning surface for the nSelf primitives.

## Quick Start

```bash
git clone https://github.com/nself-org/ntask.git my-tasks
cd my-tasks/backend && cp .env.example .env && make up
cd ../app && flutter run
```

The backend exposes Hasura at `http://localhost:8080`, Auth at `http://localhost:4000`, Storage at `http://localhost:8484`. The Flutter app picks the right target based on your build platform.

## Features

ɳTasks ships 35+ task-management capabilities (lists, tags, recurring tasks, sharing, real-time presence, calendar/today/overdue views, attachments, smart notifications, PWA install). The full inventory lives in the wiki:

- See the [Features wiki page](https://github.com/nself-org/ntask/wiki/Features) for the complete capability list with status, configuration, and usage notes.

## Installation

### Prerequisites

- Flutter 3.7+ ([install guide](https://docs.flutter.dev/get-started/install))
- Docker 20+ with Docker Compose v2
- GNU Make
- (Optional) Hasura CLI for migration management

### Backend Setup

```bash
cd backend
cp .env.example .env       # set passwords + secrets
make up                    # start the stack
make health                # verify all services are healthy
```

Stop with `make down`. View logs with `make logs`. Open a Postgres shell with `make psql`.

> **Alternative for nSelf CLI users:** if you already use nSelf, you can substitute `nself start` against a generated config. The canonical, supported path for `task/` is `make up`.

### App Setup

```bash
cd app
flutter pub get
flutter run                # picks the connected device / desktop / web target
```

For platform-specific builds:

```bash
flutter build web          # produces build/web/
flutter build apk          # Android
flutter build ios          # iOS (macOS host required)
flutter build macos        # macOS desktop
flutter build linux        # Linux desktop
flutter build windows      # Windows desktop
```

## Usage

```bash
cd backend && make up              # start backend
cd app && flutter run -d chrome    # run app in Chrome
```

```bash
cd backend && make migrate         # apply pending Hasura migrations
cd backend && make backup          # create a Postgres backup to ./backups/
cd backend && make staging-up      # bring up staging stack with Traefik HTTPS
```

```bash
cd app && flutter test                          # unit + widget tests
cd app && flutter test integration_test/        # integration tests
```

## Architecture

Flutter app talks to a Docker Compose backend (PostgreSQL 16, Hasura GraphQL Engine, Hasura Auth, Hasura Storage over MinIO, Mailpit for dev email, Traefik for staging/prod HTTPS). The app uses Hasura GraphQL as the only backend boundary; no direct Postgres access.

See the [Backend Architecture wiki page](https://github.com/nself-org/ntask/wiki/Backend-Architecture) for the full deep-dive.

## Platform Support

The app is Flutter and runs on:

| Target | Status | Notes |
|--------|--------|-------|
| Web (PWA-capable) | Active | `flutter build web`, deployed via `web/task` to `task.nself.org` |
| macOS desktop | Active | `flutter build macos` |
| Linux desktop | Active | `flutter build linux` |
| Windows desktop | Active | `flutter build windows` |
| iOS | Building | Builds locally; not yet shipped to App Store |
| Android | Building | Builds locally; not yet shipped to Google Play |

There is no separate Swift, Kotlin, React Native, or Next.js frontend: Flutter is the only client codebase.

## Tech Stack

| Layer | Technology |
|-------|------------|
| App framework | Flutter 3.7+ (Dart) |
| App state | Riverpod 2.x |
| App local storage | Hive + flutter_secure_storage |
| App networking | `http` package (GraphQL over HTTP/WS) |
| Database | PostgreSQL 16 |
| GraphQL | Hasura GraphQL Engine |
| Auth | Hasura Auth (JWT) |
| Storage | Hasura Storage over MinIO (S3-compatible) |
| Dev email | Mailpit |
| HTTPS (staging/prod) | Traefik with Let's Encrypt |
| Orchestration | Docker Compose + Makefile |

## Documentation

- [Home](https://github.com/nself-org/ntask/wiki/Home)
- [Getting Started](https://github.com/nself-org/ntask/wiki/Getting-Started)
- [Backend Setup](https://github.com/nself-org/ntask/wiki/Backend-Setup)
- [Backend Architecture](https://github.com/nself-org/ntask/wiki/Backend-Architecture)
- [Database Schema](https://github.com/nself-org/ntask/wiki/Database-Schema)
- [Features](https://github.com/nself-org/ntask/wiki/Features)
- [Deployment](https://github.com/nself-org/ntask/wiki/Deployment)
- [Security](https://github.com/nself-org/ntask/wiki/Security)

## Contributing

See [Contributing](https://github.com/nself-org/ntask/wiki/Contributing) for the contributor guide.

## License

MIT, see [LICENSE](LICENSE).

## Related Repos

- [cli](https://github.com/nself-org/cli): the nSelf CLI (not required for this repo, but the wider ecosystem entry point)
- [admin](https://github.com/nself-org/admin): local GUI companion for the CLI
- [chat](https://github.com/nself-org/nchat): open-source chat reference app (uses nSelf CLI)
- [claw](https://github.com/nself-org/nclaw): open-source AI assistant reference app (uses nSelf CLI + pro plugins)
- [ntv](https://github.com/nself-org/ntv): open-source media player reference app (uses nSelf CLI + nMedia bundle)
- [web](https://github.com/nself-org/web): `nself.org` marketing + docs + cloud (private; hosts the free demo at `task.nself.org`)
