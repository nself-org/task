# ɳTask Share Extension

This directory contains the source files for the ɳTask iOS Share Extension.

## Setup in Xcode

The extension target must be added manually in Xcode:
1. Open ios/App/App.xcworkspace in Xcode
2. File → New → Target → Share Extension
3. Product Name: ShareExtension
4. Bundle ID: org.nself.tasks.ShareExtension
5. Replace the generated source files with the ones in this directory
6. Set deployment target to iOS 16.0+

## What it does

Accepts URLs and text from other apps (Safari, Mail, etc.) and opens ɳTask
with a deep link to create a new task with the shared content pre-filled.

## Deep link format

ntasks://new-task?title=<title>&url=<url>

The main app handles this via Capacitor's deep-link plugin or the App plugin.
