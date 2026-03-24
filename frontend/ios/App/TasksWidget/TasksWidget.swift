import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Data Models

struct TaskItem: Codable {
    let id: String
    let title: String
    let completed: Bool
    let dueDate: Date?
    let listName: String?
}

// MARK: - Timeline Provider

struct TasksProvider: TimelineProvider {
    func placeholder(in context: Context) -> TasksEntry {
        TasksEntry(
            date: Date(),
            tasks: [
                TaskItem(id: "1", title: "Review project docs", completed: false, dueDate: Date(), listName: "Work"),
                TaskItem(id: "2", title: "Buy groceries", completed: false, dueDate: nil, listName: "Personal"),
                TaskItem(id: "3", title: "Morning run", completed: true, dueDate: nil, listName: nil),
            ]
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (TasksEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TasksEntry>) -> Void) {
        let tasks = loadTasksFromSharedStorage()
        let entry = TasksEntry(date: Date(), tasks: tasks)
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func loadTasksFromSharedStorage() -> [TaskItem] {
        // Reads from App Group shared UserDefaults (set by the main app)
        guard let defaults = UserDefaults(suiteName: "group.org.nself.tasks"),
              let data = defaults.data(forKey: "widget_tasks"),
              let tasks = try? JSONDecoder().decode([TaskItem].self, from: data) else {
            return []
        }
        return Array(tasks.prefix(5))
    }
}

// MARK: - Timeline Entry

struct TasksEntry: TimelineEntry {
    let date: Date
    let tasks: [TaskItem]
}

// MARK: - Widget Views

struct TasksWidgetEntryView: View {
    var entry: TasksProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            MediumWidgetView(entry: entry)
        }
    }
}

struct SmallWidgetView: View {
    let entry: TasksEntry
    var incompleteTasks: [TaskItem] { entry.tasks.filter { !$0.completed } }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(Color(red: 0.39, green: 0.40, blue: 0.95))
                Text("ɳTask")
                    .font(.caption.bold())
                    .foregroundColor(.primary)
            }
            Text("\(incompleteTasks.count)")
                .font(.system(size: 36, weight: .bold))
                .foregroundColor(Color(red: 0.39, green: 0.40, blue: 0.95))
            Text("tasks remaining")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding()
        .containerBackground(Color(.systemBackground), for: .widget)
    }
}

struct MediumWidgetView: View {
    let entry: TasksEntry
    var incompleteTasks: [TaskItem] { entry.tasks.filter { !$0.completed }.prefix(3).map { $0 } }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(Color(red: 0.39, green: 0.40, blue: 0.95))
                Text("ɳTask")
                    .font(.caption.bold())
                Spacer()
                Text("\(entry.tasks.filter { !$0.completed }.count) remaining")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            Divider()
            if incompleteTasks.isEmpty {
                Spacer()
                HStack {
                    Spacer()
                    Label("All done!", systemImage: "checkmark.seal.fill")
                        .foregroundColor(.green)
                        .font(.callout)
                    Spacer()
                }
                Spacer()
            } else {
                ForEach(incompleteTasks, id: \.id) { task in
                    TaskRowView(task: task)
                }
            }
        }
        .padding()
        .containerBackground(Color(.systemBackground), for: .widget)
    }
}

struct LargeWidgetView: View {
    let entry: TasksEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(Color(red: 0.39, green: 0.40, blue: 0.95))
                Text("ɳTask")
                    .font(.subheadline.bold())
                Spacer()
                Text("\(entry.tasks.filter { !$0.completed }.count)/\(entry.tasks.count)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Divider()
            ForEach(entry.tasks.prefix(6), id: \.id) { task in
                TaskRowView(task: task)
            }
            Spacer()
        }
        .padding()
        .containerBackground(Color(.systemBackground), for: .widget)
    }
}

struct TaskRowView: View {
    let task: TaskItem

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                .foregroundColor(task.completed ? .green : .secondary)
                .font(.caption)
            Text(task.title)
                .font(.caption)
                .lineLimit(1)
                .strikethrough(task.completed)
                .foregroundColor(task.completed ? .secondary : .primary)
            Spacer()
        }
    }
}

// MARK: - Widget Configuration

@main
struct TasksWidget: Widget {
    let kind: String = "TasksWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TasksProvider()) { entry in
            TasksWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("ɳTask")
        .description("See your upcoming tasks at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
