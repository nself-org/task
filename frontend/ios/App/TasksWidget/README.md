# ɳTask Widget

Home screen widget showing upcoming tasks. Supports small (task count), medium (top 3 tasks), and large (top 6 tasks) sizes.

## Setup in Xcode

1. Open ios/App/App.xcworkspace in Xcode
2. File → New → Target → Widget Extension
3. Product Name: TasksWidget
4. Bundle ID: org.nself.tasks.TasksWidget
5. Include Configuration Intent: NO (uses StaticConfiguration)
6. Replace generated files with TasksWidget.swift from this directory
7. Add App Group capability to both App and TasksWidget targets: group.org.nself.tasks

## Data sharing with main app

The widget reads tasks from shared App Group UserDefaults key: `widget_tasks`.
The main app must write task data there via the Capacitor plugin or native bridge.

## Updating widget data from JS

In the main app, after fetching tasks:

```typescript
// Using @capacitor/preferences (writes to app-scoped storage)
// For widget data, use the native bridge to write to App Group UserDefaults
```

A native Capacitor plugin can be added later to write to the shared App Group.
