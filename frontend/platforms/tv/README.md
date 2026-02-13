# ɳDemo TV App

**Large-screen family chore board optimized for Android TV, Apple TV, and smart TVs**

## Features

- **Extra-large fonts** - Readable from 10+ feet away
- **D-pad/Remote navigation** - Arrow keys and OK button
- **Real-time collaboration** - Instant updates across all devices
- **Shared chore lists** - Family members see the same list
- **Task approval workflow** - Kids complete, parents approve
- **Photo proof** - Take photos of completed chores (if TV has camera)
- **Simple, focused UI** - No distractions, just the task list

## TV-Specific Design

### Typography
- Minimum font size: 24px for body text
- Headings: 40-64px
- Task titles: 32px
- High contrast colors for visibility

### Navigation
- Arrow keys: Move between tasks
- OK/Enter: Select/complete task
- Back: Return to previous screen
- Focus indicators: 4px yellow border

### Layout
- Full-screen lists (no sidebars)
- One list at a time
- 5-7 visible tasks per screen
- Large touch targets (80x80px minimum)

## Use Cases

### Family Chore Board
```
Living Room TV showing "Family Chores" list:
- Kids see tasks assigned to them
- Parents see all tasks + approval queue
- Real-time updates when anyone completes a task
- Photo proof required for "Room Clean" tasks
```

### Kitchen Task Board
```
Kitchen tablet showing "Meal Prep" list:
- Step-by-step cooking tasks
- Timer integration
- Photos of each completed step
- Family members can help and mark steps done
```

## Development

### Run on TV Emulator
```bash
# Android TV emulator (requires Android Studio)
pnpm tv:android

# Build for Android TV
pnpm tv:build:android

# Install APK on Android TV
adb connect <tv-ip-address>
adb install platforms/tv/android/app/build/outputs/apk/release/app-release.apk
```

### Run on Apple TV
```bash
# Requires Xcode and Apple TV device/simulator
pnpm tv:ios

# Build for Apple TV
pnpm tv:build:ios
```

## Configuration

### TV-specific environment variables
```bash
NEXT_PUBLIC_TV_MODE=true
NEXT_PUBLIC_TV_LAYOUT=fullscreen
NEXT_PUBLIC_TV_FONT_SCALE=1.5
NEXT_PUBLIC_TV_NAVIGATION=dpad
```

## Testing Checklist

- [ ] D-pad navigation works (up/down/left/right)
- [ ] OK button completes tasks
- [ ] Back button returns to list selection
- [ ] Fonts readable from 10 feet
- [ ] Real-time updates appear instantly
- [ ] Approval workflow works (complete → approve)
- [ ] Photo capture works (if TV has camera)
- [ ] No hover states (TV has no mouse)
- [ ] Focus indicators visible
- [ ] Works on old Android TV boxes (Android 8.0+)

## Screen Layouts

### List View (Main Screen)
```
┌─────────────────────────────────────────────┐
│  Family Chores              👤 👤 👤 (3)    │
│─────────────────────────────────────────────│
│                                             │
│  ☐ Clean bedroom               🔴 High     │
│     📸 Photo required                       │
│                                             │
│  ☐ Do homework                  🟡 Med      │
│     ⏰ Due today at 5pm                     │
│                                             │
│  ☑ Take out trash              ✅ Approved  │
│     by Dad · 2 min ago                      │
│                                             │
│  ☑ Feed the dog                ⏳ Pending   │
│     Awaiting approval                       │
│                                             │
│  ☐ Water plants                             │
│                                             │
└─────────────────────────────────────────────┘
```

### Approval Queue (Owner/Admin View)
```
┌─────────────────────────────────────────────┐
│  Awaiting Approval (2)                      │
│─────────────────────────────────────────────│
│                                             │
│  ☑ Clean bedroom                           │
│     ✅ Approve  ❌ Reject                   │
│     Completed by Sarah · 5 min ago         │
│     📷 View photo                           │
│                                             │
│  ☑ Do homework                              │
│     ✅ Approve  ❌ Reject                   │
│     Completed by John · 10 min ago         │
│                                             │
└─────────────────────────────────────────────┘
```

## Deployment

### Android TV (.apk)
```bash
# Build signed release APK
cd platforms/tv/android
./gradlew assembleRelease

# APK location:
# platforms/tv/android/app/build/outputs/apk/release/app-release.apk
```

### Apple TV (.ipa)
```bash
# Build with Xcode
# Archive → Distribute App → Ad Hoc
```

### Web (fallback for any TV browser)
```bash
# Detect TV user agent and serve TV-optimized layout
pnpm build
# Deploy to Vercel/Netlify with TV mode auto-detection
```

## Browser Support

- Android TV Browser (Chromium-based)
- Samsung Smart TV Browser (Tizen)
- LG Smart TV Browser (webOS)
- Apple TV Safari (tvOS)
- Roku Browser (limited, basic HTML/CSS only)

## Accessibility

- Large focus indicators
- Screen reader support
- Voice control compatible
- Color-blind friendly palette
- High contrast mode

## Coming Soon

- [ ] Voice control ("Hey Google, mark task done")
- [ ] QR code login (scan with phone)
- [ ] Timer integration for time-based tasks
- [ ] Gamification (points, streaks, leaderboard)
- [ ] Profiles with avatars
- [ ] Multiple list view (split screen for 2 lists)
