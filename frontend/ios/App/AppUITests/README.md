# ɳTask iOS UI Tests

XCTest UI test suite for the ɳTask iOS app.

## Setup in Xcode

1. Open ios/App/App.xcworkspace
2. File → New → Target → UI Testing Bundle
3. Product Name: AppUITests
4. Bundle ID: org.nself.tasks.AppUITests
5. Replace generated files with files from this directory

## Running tests

In Xcode: Product → Test (⌘U)
On simulator: Runs automatically
On device: Requires signing

## CI integration

See .github/workflows/ios-release.yml for CI configuration.
Tests run as part of the archive step.
