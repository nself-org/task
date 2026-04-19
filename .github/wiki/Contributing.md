# Contributing to ɳTasks

Thank you for considering contributing to ɳTasks! This document outlines the guidelines for contributing.

## What This Is

ɳTasks is an open-source task management app. It uses **Docker Compose directly** for its backend (the "any-stack" reference — showing nSelf-style architecture without requiring the nSelf CLI). The app itself is a **Flutter** project (Dart, Riverpod, Hive local cache) running on iOS, Android, macOS, Linux, Windows, and Web.

For the architectural rationale of the Docker Compose direct approach, see the PRI § "Backend Approach: Docker Compose Direct (Ref-App Exception)".

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. See [Code of Conduct](Code-of-Conduct).

## Prerequisites

- Flutter 3.7+
- Dart (bundled with Flutter)
- Docker 20+
- Make
- (optional) Hasura CLI for migration work

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/nself-org/ntask/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Platform (iOS / Android / macOS / Linux / Windows / Web) and device
   - Backend state (`backend/.env` provider, Docker version)
   - Screenshots if applicable
   - Environment details (OS, Flutter version from `flutter --version`)

### Suggesting Features

1. Check [Discussions](https://github.com/nself-org/ntask/discussions) for existing suggestions
2. Create a new discussion with:
   - Clear use case
   - Proposed implementation (if you have ideas)
   - Benefits to users
   - Potential challenges

## Setup

```bash
git clone https://github.com/nself-org/ntask
cd ntask
```

### Backend (Docker Compose direct — D6 ref-app exception)

```bash
cd backend
cp .env.example .env       # first-time only
make up                    # start backend (PostgreSQL, Hasura, Auth, Storage, Mailpit)
make health                # smoke check
make down                  # stop backend
```

> **Important:** ɳTasks is the documented "any-stack" reference app. It runs the same Postgres + Hasura + Auth + MinIO + Traefik stack that nSelf builds, but exposed as plain Docker Compose so you can study, fork, and adapt it without the nSelf CLI. Other Type C apps (nchat, nclaw, ntv) demonstrate the nSelf CLI flow instead. Do not attempt to migrate this repo's backend to `nself start`.

### App (Flutter)

```bash
cd app
flutter pub get
flutter run                # default device
flutter run -d chrome      # web
flutter run -d macos       # macOS desktop
```

## Pull Requests

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style (Dart conventions, Riverpod patterns)
   - Add tests where applicable
   - Update wiki docs if user-visible behavior changes
   - Keep commits focused and atomic

4. **Test your changes**

   ```bash
   cd app
   dart format .
   flutter analyze
   flutter test
   flutter test integration_test/
   ```

   And backend:

   ```bash
   cd backend && make up && make health
   ```

5. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commit messages:
   - `feat:` — New feature
   - `fix:` — Bug fix
   - `docs:` — Documentation changes
   - `style:` — Code style changes (formatting, etc.)
   - `refactor:` — Code refactoring
   - `test:` — Adding or updating tests
   - `chore:` — Maintenance tasks

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template
   - Link related issues

## Development Guidelines

### Code Style

- Use `dart format .` before every commit
- `flutter analyze` must be clean (no info / warning / error)
- Follow existing patterns in the codebase
- Prefer Riverpod providers over raw `setState` for shared state
- Keep widget files focused; extract sub-widgets when files grow past ~300 lines
- All UI must support light + dark themes

### Backend Boundary

The Flutter app talks to **Hasura GraphQL only** — never directly to Postgres. If you need a new field/relation, add a Hasura migration in `backend/hasura/migrations/` and apply it with `make migrate`.

### File Organization (Flutter app)

```
app/lib/
  features/
    feature-name/
      providers/
      screens/
      widgets/
      models/
  shared/
    widgets/
    services/
  main.dart
```

### Testing

- Unit tests: `flutter test`
- Widget tests: alongside widgets in `app/test/`
- Integration tests: `app/integration_test/` — exercise full backend round-trips
- Test responsive layouts (mobile, tablet, desktop)
- Test light + dark themes
- Test error states (offline, auth failure, schema mismatch)

### Documentation

- Update `README.md` if adding user-visible features
- Update `.github/wiki/` pages (Backend-Setup, Backend-Architecture, Features, etc.) when behavior changes
- Add Dart-doc comments for non-obvious public APIs

## Adding New Features

### New Screen / Feature Module

1. Create `app/lib/features/<name>/`
2. Add Riverpod providers in `providers/`
3. Add screens in `screens/`
4. Wire route in router config
5. Add widget tests in `app/test/features/<name>/`

### New GraphQL Operation

1. Define query/mutation in the relevant feature's `providers/`
2. Generate types if codegen is configured
3. Add Hasura permissions migration if a new role/permission is required
4. Update `Database-Schema.md` wiki if the schema shape changes

### New Hasura Migration

1. `cd backend && hasura migrate create <name>` (or hand-write SQL in `backend/hasura/migrations/`)
2. `make migrate` to apply locally
3. Commit migration files
4. Update `Database-Schema.md` wiki

## Review Process

1. Maintainers will review your PR
2. CI must pass (lint, analyze, tests, doc-sync, clean-root, nself-first-check)
3. Address any feedback
4. Once approved, a maintainer will merge
5. Your contribution will be credited in release notes

## Questions?

- Check existing [Issues](https://github.com/nself-org/ntask/issues)
- Join [Discussions](https://github.com/nself-org/ntask/discussions)
- Read the [README](https://github.com/nself-org/ntask/blob/main/README.md) and the [Backend-Setup](Backend-Setup) wiki page

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to ɳTasks!
