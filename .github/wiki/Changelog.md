# Changelog

All notable changes to ɳApp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- ci: switch sync-wiki workflow to `strategy: init` to initialize wiki repo when missing (S26 T04)

### Added

- Initial release of ɳApp boilerplate
- Multi-backend support (ɳSelf, Supabase, Nhost)
- Cross-platform support (Web, Desktop via Tauri, PWA)
- Authentication system with email/password
- Database migrations for profiles and todos
- Real-time subscriptions
- Offline-first architecture with IndexedDB caching
- UI component library (shadcn/ui)
- Development tools and faux-signin mode
- Testing infrastructure (Vitest + Playwright)
- CI/CD workflows (GitHub Actions)
- Docker support with multi-stage builds
- Deployment guides for multiple platforms
- Pre-commit hooks with Husky
- Automated dependency updates (Renovate)
- SEO optimization (sitemap, robots.txt)
- Database seeding scripts
- Example API routes

## [0.1.0] - 2026-02-08

### Added

- Initial project setup
- Next.js 13.5 with App Router
- TypeScript configuration
- Tailwind CSS styling
- Basic authentication flow
- Todo list example
- Profile management
- Storage integration
- GraphQL support for Hasura-based backends
- Platform detection utilities
- Health check endpoints
- Error boundaries
- Service worker for PWA
- Environment-based configuration
- Documentation (README, QUICKSTART, CONTRIBUTING, SECURITY)

### Changed

- N/A (Initial release)

### Deprecated

- N/A (Initial release)

### Removed

- N/A (Initial release)

### Fixed

- N/A (Initial release)

### Security

- Row Level Security (RLS) policies for all database tables
- Secure authentication token storage
- CORS configuration for API routes
- Input validation with Zod schemas

---

## How to Update This Changelog

When making changes to the project:

1. Add entries under the `[Unreleased]` section
2. Use the following categories:
   - **Added** for new features
   - **Changed** for changes in existing functionality
   - **Deprecated** for soon-to-be removed features
   - **Removed** for now removed features
   - **Fixed** for any bug fixes
   - **Security** for vulnerability fixes

3. When releasing a new version:
   - Move entries from `[Unreleased]` to a new version section
   - Update the version number and date
   - Follow [Semantic Versioning](https://semver.org/):
     - MAJOR version for incompatible API changes
     - MINOR version for backwards-compatible functionality
     - PATCH version for backwards-compatible bug fixes

### Example Entry Format

```markdown
## [1.2.3] - 2026-03-15

### Added

- New feature description (#PR-number)

### Fixed

- Bug fix description (#PR-number)
```

---

## Version History

- [0.1.0] - Initial release (2026-02-08)

---

**Note:** This changelog is maintained manually. Contributors are expected to update it as part of their pull requests.
