# ɳTasks Releases

This directory contains all production builds for ɳTasks across all platforms.

---

## Quick Release

Build all platforms with one command:

```bash
cd frontend
pnpm release
```

This will:
- ✅ Build web app (static export)
- ✅ Build Android APK (mobile + TV)
- ⚡ Build iOS IPA (if on macOS with Xcode)
- ⚡ Build desktop apps (if Rust/Tauri available)
- 📦 Package everything to `.releases/`
- 🔐 Generate SHA256 checksums
- 📝 Create release notes

---

## Release Commands

| Command | What It Builds | Speed |
|---------|----------------|-------|
| `pnpm release` | Web + Android + Desktop (full build) | ~5-10 min |
| `pnpm release:web` | Web only | ~30s |
| `pnpm release:mobile` | Android APK only | ~2-3 min |
| `pnpm release:all` | Same as `pnpm release` | ~5-10 min |

---

## Directory Structure

```
.releases/
├── web/                    # Static web builds
│   ├── nself-tasks-web-v0.1.0-*.zip
│   └── nself-tasks-web-v0.1.0-*.tar.gz
├── android/                # Android mobile APKs
│   └── nself-tasks-v0.1.0-*.apk
├── ios/                    # iOS mobile IPAs
│   └── nself-tasks-v0.1.0-*.ipa
├── tv/
│   └── android-tv/         # Android TV APKs
│       └── nself-tasks-tv-v0.1.0-*.apk
├── macos/                  # macOS desktop apps
│   ├── nself-tasks-v0.1.0-*.dmg
│   └── nself-tasks-v0.1.0-*.app
├── windows/                # Windows desktop apps
│   └── nself-tasks-v0.1.0-*.msi
├── linux/                  # Linux desktop apps
│   ├── nself-tasks-v0.1.0-*.AppImage
│   └── nself-tasks-v0.1.0-*.deb
├── checksums-v0.1.0-*.txt  # SHA256 checksums
└── RELEASE-v0.1.0-*.md     # Release notes
```

---

## Platform Support

### Web
- **Format**: ZIP, TAR.GZ
- **Compatibility**: Any static host (Vercel, Netlify, S3, etc.)
- **Deployment**: Extract and deploy to web server
- **Size**: ~5-10 MB

### Android (Mobile)
- **Format**: APK
- **Min Version**: Android 8.0 (API 26)
- **Architecture**: Universal (ARM64, ARMv7, x86_64)
- **Installation**: ADB, Google Play, or manual transfer
- **Size**: ~15-25 MB

### Android TV
- **Format**: APK (same as mobile, TV-optimized UI)
- **Min Version**: Android TV 8.0
- **Features**: D-pad navigation, large fonts, 10ft UI
- **Installation**: ADB or sideload
- **Size**: ~15-25 MB

### iOS (Mobile)
- **Format**: IPA
- **Min Version**: iOS 13.0
- **Requires**: Apple Developer account for distribution
- **Installation**: TestFlight, App Store, or Enterprise
- **Size**: ~20-30 MB

### Desktop (macOS)
- **Format**: DMG, APP
- **Min Version**: macOS 10.15 (Catalina)
- **Architecture**: Universal (Intel + Apple Silicon)
- **Installation**: Drag to Applications folder
- **Size**: ~5-10 MB

### Desktop (Windows)
- **Format**: MSI
- **Min Version**: Windows 10
- **Architecture**: x64
- **Installation**: Run installer
- **Size**: ~5-10 MB

### Desktop (Linux)
- **Format**: AppImage, DEB
- **Min Version**: Ubuntu 18.04+ (or equivalent)
- **Architecture**: x86_64
- **Installation**: AppImage (portable), DEB (system install)
- **Size**: ~5-10 MB

---

## Release Process

### 1. Prepare Release

```bash
cd frontend

# Update version in package.json
npm version patch  # or minor, major

# Verify build passes
pnpm build
pnpm test

# Commit version bump
git add package.json
git commit -m "chore: bump version to v$(node -p \"require('./package.json').version\")"
git push
```

### 2. Build Release

```bash
# Full multi-platform release
pnpm release

# Or quick web-only release
pnpm release:web
```

### 3. Test Release

Test on actual devices before distribution:
- **Web**: Deploy to staging environment
- **Android**: Install APK on test devices
- **iOS**: TestFlight with beta testers
- **Desktop**: Install on clean VMs

### 4. Distribute Release

#### Option A: GitHub Releases
```bash
# Tag the release
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# Upload to GitHub Releases
gh release create v0.1.0 \
  .releases/web/*.zip \
  .releases/android/*.apk \
  .releases/tv/android-tv/*.apk \
  .releases/checksums-*.txt \
  --title "v0.1.0" \
  --notes-file .releases/RELEASE-*.md
```

#### Option B: Direct Download
Upload files to your own hosting:
- Static web hosting (S3, DO Spaces, etc.)
- CDN for fast downloads
- Add download links to your website

#### Option C: App Stores
- **Google Play**: Upload APK via Play Console
- **Apple App Store**: Upload IPA via App Store Connect
- **Microsoft Store**: Upload MSI via Partner Center

---

## Signing & Security

### Android Signing

For production releases, sign with your keystore:

```bash
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=/path/to/keystore.jks \
  -Pandroid.injected.signing.store.password=KEYSTORE_PASSWORD \
  -Pandroid.injected.signing.key.alias=KEY_ALIAS \
  -Pandroid.injected.signing.key.password=KEY_PASSWORD
```

### iOS Signing

Configure signing in Xcode:
1. Open `ios/App.xcworkspace`
2. Select App target → Signing & Capabilities
3. Choose your Team and Provisioning Profile
4. Archive → Distribute App

### Desktop Signing

**macOS**: Code sign with Apple Developer Certificate
```bash
codesign --deep --force --verify --verbose --sign "Developer ID" app.app
```

**Windows**: Sign with code signing certificate
```powershell
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com app.msi
```

---

## Checksums Verification

Verify download integrity:

```bash
# Generate checksums
shasum -a 256 nself-tasks-*.apk

# Compare with checksums-*.txt
cat checksums-v0.1.0-*.txt
```

---

## Automation (CI/CD)

### GitHub Actions Example

```yaml
name: Release All Platforms

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: cd frontend && pnpm install

      - name: Build all platforms
        run: cd frontend && pnpm release

      - name: Upload to GitHub Releases
        uses: softprops/action-gh-release@v1
        with:
          files: .releases/**/*
```

---

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (v2.0.0): Breaking changes
- **MINOR** (v1.1.0): New features (backward compatible)
- **PATCH** (v1.0.1): Bug fixes

Build numbers are auto-generated: `v{VERSION}-{YYYYMMDD-HHMMSS}`

---

## Troubleshooting

### "Android SDK not found"
Install Android Studio and set `ANDROID_HOME`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### "Rust/Tauri not found"
Install Rust and Tauri prerequisites:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### "Xcode not found" (macOS)
Install Xcode from Mac App Store and accept license:
```bash
sudo xcode-select --install
sudo xcodebuild -license accept
```

### "Build fails on CI"
Ensure CI has all required tools:
- Node.js 18+
- pnpm
- Java 11+ (for Android)
- Xcode (for iOS, macOS only)
- Rust + Tauri (for desktop)

---

## Download Links (Example)

Once released, users can download from:

```
https://releases.nself.org/tasks/latest/web/nself-tasks-web-latest.zip
https://releases.nself.org/tasks/latest/android/nself-tasks-latest.apk
https://releases.nself.org/tasks/latest/ios/nself-tasks-latest.ipa
https://releases.nself.org/tasks/latest/macos/nself-tasks-latest.dmg
https://releases.nself.org/tasks/latest/windows/nself-tasks-latest.msi
https://releases.nself.org/tasks/latest/linux/nself-tasks-latest.AppImage
```

Or via GitHub Releases:
```
https://github.com/nself-org/tasks/releases/latest
```

---

**Questions?** Open an issue at https://github.com/nself-org/tasks/issues
