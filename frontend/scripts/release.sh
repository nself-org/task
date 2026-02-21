#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
DATE=$(date +%Y%m%d-%H%M%S)
RELEASE_NAME="v${VERSION}-${DATE}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           ɳDemo Multi-Platform Release Builder                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Version:${NC} ${RELEASE_NAME}"
echo ""

# Create release directories
RELEASE_DIR="../.releases"
mkdir -p "$RELEASE_DIR"/{web,android,ios,tv/android-tv,macos,windows,linux}

# Track what was built
BUILT=()
SKIPPED=()

# =============================================================================
# 1. WEB BUILD
# =============================================================================
echo -e "${YELLOW}[1/7] Building Web App...${NC}"
if pnpm build; then
    echo -e "${GREEN}✓ Web build successful${NC}"

    # Create zip of out/ directory
    cd out
    zip -r "../../.releases/web/nself-demo-web-${RELEASE_NAME}.zip" . > /dev/null
    cd ..

    # Create tar.gz for Linux users
    cd out
    tar -czf "../../.releases/web/nself-demo-web-${RELEASE_NAME}.tar.gz" . > /dev/null
    cd ..

    BUILT+=("Web (Static)")
    echo -e "${GREEN}  → Saved to: .releases/web/${NC}"
else
    echo -e "${RED}✗ Web build failed${NC}"
    SKIPPED+=("Web")
fi
echo ""

# =============================================================================
# 2. ANDROID BUILD
# =============================================================================
echo -e "${YELLOW}[2/7] Building Android App...${NC}"
if command -v gradle &> /dev/null || [ -d "android" ]; then
    if pnpm dlx cap sync android && cd android && ./gradlew assembleRelease; then
        echo -e "${GREEN}✓ Android build successful${NC}"

        # Copy APK to releases
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        if [ -f "$APK_PATH" ]; then
            cp "$APK_PATH" "../../.releases/android/nself-demo-${RELEASE_NAME}.apk"
            # Also copy to TV directory (same APK works for both)
            cp "$APK_PATH" "../../.releases/tv/android-tv/nself-demo-tv-${RELEASE_NAME}.apk"
            BUILT+=("Android (Mobile + TV)")
            echo -e "${GREEN}  → Saved to: .releases/android/ and .releases/tv/android-tv/${NC}"
        fi
        cd ..
    else
        echo -e "${RED}✗ Android build failed${NC}"
        SKIPPED+=("Android")
        cd ..
    fi
else
    echo -e "${YELLOW}⊘ Skipping Android (Android SDK not found)${NC}"
    SKIPPED+=("Android (No SDK)")
fi
echo ""

# =============================================================================
# 3. iOS BUILD
# =============================================================================
echo -e "${YELLOW}[3/7] Building iOS App...${NC}"
if [[ "$OSTYPE" == "darwin"* ]] && command -v xcodebuild &> /dev/null; then
    if pnpm dlx cap sync ios; then
        echo -e "${BLUE}  Note: iOS requires manual archive in Xcode${NC}"
        echo -e "${BLUE}  Run: cd ios && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release archive${NC}"
        SKIPPED+=("iOS (Manual build required)")
    else
        echo -e "${RED}✗ iOS sync failed${NC}"
        SKIPPED+=("iOS (Sync failed)")
    fi
else
    echo -e "${YELLOW}⊘ Skipping iOS (macOS with Xcode required)${NC}"
    SKIPPED+=("iOS (Not on macOS)")
fi
echo ""

# =============================================================================
# 4. DESKTOP BUILD (Tauri)
# =============================================================================
echo -e "${YELLOW}[4/7] Building Desktop App...${NC}"
if command -v cargo &> /dev/null && [ -d "platforms/desktop/tauri" ]; then
    cd platforms/desktop/tauri
    if cargo tauri build; then
        echo -e "${GREEN}✓ Desktop build successful${NC}"

        # Copy binaries based on platform
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if [ -d "target/release/bundle/dmg" ]; then
                cp target/release/bundle/dmg/*.dmg "../../../../.releases/macos/nself-demo-${RELEASE_NAME}.dmg" 2>/dev/null || true
                BUILT+=("macOS (DMG)")
            fi
            if [ -d "target/release/bundle/macos" ]; then
                cp -r target/release/bundle/macos/*.app "../../../../.releases/macos/nself-demo-${RELEASE_NAME}.app" 2>/dev/null || true
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if [ -d "target/release/bundle/appimage" ]; then
                cp target/release/bundle/appimage/*.AppImage "../../../../.releases/linux/nself-demo-${RELEASE_NAME}.AppImage" 2>/dev/null || true
                BUILT+=("Linux (AppImage)")
            fi
            if [ -d "target/release/bundle/deb" ]; then
                cp target/release/bundle/deb/*.deb "../../../../.releases/linux/nself-demo-${RELEASE_NAME}.deb" 2>/dev/null || true
                BUILT+=("Linux (DEB)")
            fi
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            # Windows
            if [ -d "target/release/bundle/msi" ]; then
                cp target/release/bundle/msi/*.msi "../../../../.releases/windows/nself-demo-${RELEASE_NAME}.msi" 2>/dev/null || true
                BUILT+=("Windows (MSI)")
            fi
        fi

        cd ../../..
        echo -e "${GREEN}  → Saved to: .releases/[platform]/${NC}"
    else
        echo -e "${RED}✗ Desktop build failed${NC}"
        SKIPPED+=("Desktop")
        cd ../../..
    fi
else
    echo -e "${YELLOW}⊘ Skipping Desktop (Rust/Tauri not found)${NC}"
    SKIPPED+=("Desktop (No Rust)")
fi
echo ""

# =============================================================================
# 5. GENERATE CHECKSUMS
# =============================================================================
echo -e "${YELLOW}[5/7] Generating Checksums...${NC}"
cd "$RELEASE_DIR"
find . -type f \( -name "*.apk" -o -name "*.ipa" -o -name "*.dmg" -o -name "*.msi" -o -name "*.deb" -o -name "*.AppImage" -o -name "*.zip" -o -name "*.tar.gz" \) -exec shasum -a 256 {} \; > "checksums-${RELEASE_NAME}.txt" 2>/dev/null || true
cd - > /dev/null
echo -e "${GREEN}✓ Checksums generated${NC}"
echo ""

# =============================================================================
# 6. GENERATE RELEASE INFO
# =============================================================================
echo -e "${YELLOW}[6/7] Generating Release Info...${NC}"
cat > "$RELEASE_DIR/RELEASE-${RELEASE_NAME}.md" << EOF
# ɳDemo Release ${RELEASE_NAME}

**Version**: ${VERSION}
**Date**: $(date +"%Y-%m-%d %H:%M:%S")
**Build**: ${RELEASE_NAME}

---

## Built Platforms

EOF

for platform in "${BUILT[@]}"; do
    echo "- ✅ $platform" >> "$RELEASE_DIR/RELEASE-${RELEASE_NAME}.md"
done

if [ ${#SKIPPED[@]} -gt 0 ]; then
    echo "" >> "$RELEASE_DIR/RELEASE-${RELEASE_NAME}.md"
    echo "## Skipped Platforms" >> "$RELEASE_DIR/RELEASE-${RELEASE_NAME}.md"
    echo "" >> "$RELEASE_DIR/RELEASE-${RELEASE_NAME}.md"
    for platform in "${SKIPPED[@]}"; do
        echo "- ⊘ $platform" >> "$RELEASE_DIR/RELEASE-${RELEASE_NAME}.md"
    done
fi

cat >> "$RELEASE_DIR/RELEASE-${RELEASE_NAME}.md" << EOF

---

## Installation

### Web
\`\`\`bash
unzip nself-demo-web-${RELEASE_NAME}.zip -d web
# Deploy to any static host
\`\`\`

### Android
\`\`\`bash
adb install nself-demo-${RELEASE_NAME}.apk
# Or transfer to device and install manually
\`\`\`

### Android TV
\`\`\`bash
adb connect <tv-ip-address>
adb install nself-demo-tv-${RELEASE_NAME}.apk
\`\`\`

### Desktop
- **macOS**: Open the .dmg file and drag to Applications
- **Windows**: Run the .msi installer
- **Linux**:
  - AppImage: \`chmod +x *.AppImage && ./nself-demo-*.AppImage\`
  - DEB: \`sudo dpkg -i nself-demo-*.deb\`

---

## Checksums

See \`checksums-${RELEASE_NAME}.txt\` for SHA256 hashes of all release files.

---

## What's Included

- **Web**: Static Next.js build (deploy to Vercel, Netlify, etc.)
- **Android**: Mobile app APK (Android 8.0+)
- **Android TV**: TV-optimized app (Android TV 8.0+)
- **iOS**: Mobile app IPA (iOS 13+) [if built]
- **Desktop**: Native desktop apps via Tauri

---

**Project**: ɳDemo - Universal Next.js Boilerplate
**Repository**: https://github.com/nself-org/demo
**License**: MIT
EOF

echo -e "${GREEN}✓ Release info generated${NC}"
echo ""

# =============================================================================
# 7. SUMMARY
# =============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Release Summary                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Built:${NC}"
for platform in "${BUILT[@]}"; do
    echo -e "  ${GREEN}✓${NC} $platform"
done

if [ ${#SKIPPED[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Skipped:${NC}"
    for platform in "${SKIPPED[@]}"; do
        echo -e "  ${YELLOW}⊘${NC} $platform"
    done
fi

echo ""
echo -e "${BLUE}Release Files:${NC} $(cd "$RELEASE_DIR" && find . -type f \( -name "*.apk" -o -name "*.ipa" -o -name "*.dmg" -o -name "*.msi" -o -name "*.deb" -o -name "*.AppImage" -o -name "*.zip" -o -name "*.tar.gz" \) | wc -l | tr -d ' ')"
echo -e "${BLUE}Location:${NC} .releases/"
echo ""
echo -e "${GREEN}✓ Release ${RELEASE_NAME} complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Test the builds on target platforms"
echo -e "  2. Review .releases/RELEASE-${RELEASE_NAME}.md"
echo -e "  3. Upload to GitHub releases / distribution platform"
echo ""
