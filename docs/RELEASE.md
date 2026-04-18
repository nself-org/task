# ɳTask Release Guide

This guide covers how ɳTask is signed and shipped on each platform. Until store
automation lands, every release is produced manually from a clean checkout.

> All version bumps and tag creation require an approved release plan.
> Do not bump `pubspec.yaml` or create a git tag without explicit approval.

## Versioning

- Source of truth: `app/pubspec.yaml` `version:` line (`<semver>+<build>`)
- Current: `1.0.0+1`
- Bump `+build` on every store submission even if semver is unchanged, so each
  upload has a unique build number
- Update the version badge in `README.md` when shipping a new semver

## Android (Google Play)

### Prerequisites

- Flutter 3.7+ installed
- Android SDK platform-tools 34+
- JDK 17
- A keystore file (`.jks`) — **never commit this, never check into git**
- A filled-out `app/android/key.properties`:
  ```
  storePassword=<keystore password>
  keyPassword=<key password>
  keyAlias=<alias>
  storeFile=<absolute path to .jks>
  ```

### Build a signed bundle

```bash
cd app
flutter clean
flutter pub get
flutter build appbundle --release
```

Output: `app/build/app/outputs/bundle/release/app-release.aab`

### Submit to Play

1. Open Google Play Console → ɳTask → Production → Create new release.
2. Upload `app-release.aab`. Rollout percentage starts at 20%, ramps over 48h.
3. Paste release notes from `.releases/` directory.
4. Review and roll out.

## iOS (App Store)

### Prerequisites

- macOS host with Xcode 15+
- Active Apple Developer account (`aric.camarata@gmail.com` team)
- Distribution certificate in the Keychain
- App Store provisioning profile for `com.nself.task`

### Build and archive

```bash
cd app
flutter clean
flutter pub get
flutter build ipa --release
```

Output: `app/build/ios/ipa/ntask.ipa`

### Submit to App Store

1. Open `app/build/ios/archive/Runner.xcarchive` in Xcode → Organizer.
2. Validate → Distribute App → App Store Connect → Upload.
3. In App Store Connect, attach the new build to the prepared version.
4. Fill in What's New, upload a screenshot set if missing, submit for review.

## Web (PWA)

The live PWA at `task.nself.org` is served from `web/task/` on Vercel. The
Flutter web build target used there is produced with:

```bash
cd app
flutter build web --release --pwa-strategy offline-first
```

The `web/task` Next.js app includes the Flutter web output under `/app` so
users can install it as a PWA on any device.

## macOS desktop

```bash
cd app
flutter build macos --release
```

Output: `app/build/macos/Build/Products/Release/ɳTask.app`

For distribution:
- Notarize with Apple notary service before zipping
- Optionally package as `.dmg` with `create-dmg`

## Linux / Windows desktop

```bash
cd app
flutter build linux --release     # on Linux host
flutter build windows --release   # on Windows host
```

Ship the zipped build folder as a GitHub Release asset for the tagged version.

## Signing assets — where they live

- iOS distribution cert + provisioning profile: developer Mac Keychain (not in
  repo). Export a backup `.p12` to the password manager only.
- Android keystore: developer machine, backed up to the password manager. The
  `app/android/key.properties` file is listed in `.gitignore` and must never be
  committed.
- macOS notarization credentials: stored in `xcrun notarytool store-credentials`
  profile on the developer machine.

## Release checklist

Before shipping any platform build:

1. Run `flutter analyze` — must be clean.
2. Run `flutter test` — must be clean.
3. Run backend smoke: `cd ../backend && ./test/smoke.sh`.
4. Manual sanity on the primary platform: login, create list, add task, tick
   task, sync status shows green.
5. Write release notes in `.releases/<version>.md` and update
   `.github/wiki/Changelog.md`.
6. Tag the release: `git tag v<version> && git push --tags`.
7. Submit to the store. For Android and iOS, ramp rollout in stages.
