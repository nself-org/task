# Database Schema

Complete reference for the ɳTask application database schema with advanced collaborative features.

---

## Overview

The schema implements a **Google Docs-like collaborative todo list system** with:
- Multiple lists per user with customization
- Advanced todo metadata (priority, tags, due dates, location, recurring, attachments)
- Real-time presence tracking
- Granular sharing permissions (owner/editor/viewer)
- Smart notifications (6 types)
- User preferences with real-time sync
- Background workers (recurring tasks, reminders, geolocation)

**Total Tables**: 8
**Total Indexes**: 20+
**Total Foreign Keys**: 12+
**Total Triggers**: 5

---

## Tables

### `app_profiles`

User profiles, automatically created on signup. Extended with preferences support.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (references auth.users.id) |
| `email` | TEXT | User's email address |
| `display_name` | TEXT | Display name for UI |
| `avatar_url` | TEXT | Avatar image URL |
| `bio` | TEXT | User bio/description |
| `time_format` | TEXT | Preferred time format (12h or 24h) |
| `theme_preference` | TEXT | Theme preference (light, dark, system) |
| `default_list_id` | UUID | Default list to open (references app_lists.id) |
| `notification_settings` | JSONB | Notification preferences |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | Last updated (auto-updated) |

**Indexes:**
- Primary key on `id`
- Foreign key index on `default_list_id`

**Triggers:**
- Auto-creates profile when user signs up
- Auto-updates `updated_at` on changes

**Example:**
```graphql
query {
  app_profiles {
    id
    email
    display_name
    avatar_url
    time_format
    theme_preference
    default_list_id
    notification_settings
  }
}
```

---

### `app_lists`

Todo list containers. Each user can have multiple lists with custom colors, icons, and locations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Owner (references auth.users.id) |
| `title` | TEXT | List title (default: "Untitled List") |
| `description` | TEXT | Optional description |
| `color` | TEXT | Hex color code (default: "#6366f1") |
| `icon` | TEXT | Icon name or emoji (default: "list") |
| `is_default` | BOOLEAN | Whether this is the user's default list |
| `position` | INTEGER | Sort order (for drag-and-drop) |
| `location_name` | TEXT | Location name (e.g., "Whole Foods") |
| `location_lat` | NUMERIC(10,8) | Latitude for geo-reminders |
| `location_lng` | NUMERIC(11,8) | Longitude for geo-reminders |
| `location_radius` | INTEGER | Reminder radius in meters (default: 100) |
| `reminder_on_arrival` | BOOLEAN | Enable arrival notifications |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | Last updated (auto-updated) |

**Indexes:**
- Primary key on `id`
- Index on `user_id` (for user queries)
- Index on `position` (for sorting)

**Permissions (RLS):**
- Users can CRUD their own lists
- Users can view lists shared with them (via app_list_shares)

**Triggers:**
- Auto-updates `updated_at` on changes
- Auto-creates default list on user signup

**Example:**
```graphql
mutation {
  insert_app_lists_one(object: {
    title: "Grocery Shopping"
    description: "Weekly groceries"
    color: "#10b981"
    icon: "🛒"
    location_name: "Whole Foods Market"
    location_lat: 37.7749
    location_lng: -122.4194
    location_radius: 100
    reminder_on_arrival: true
  }) {
    id
    title
    color
    icon
  }
}
```

---

### `app_todos`

Todo items with extensive metadata for advanced task management.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Owner (references auth.users.id) |
| `list_id` | UUID | Parent list (references app_lists.id) |
| `title` | TEXT | Todo title (required) |
| `description` | TEXT | Optional description |
| `completed` | BOOLEAN | Completion status |
| `completed_at` | TIMESTAMPTZ | When completed (NULL if not completed) |
| `is_public` | BOOLEAN | Public visibility toggle |
| `position` | INTEGER | Sort order within list (default: 0) |
| `priority` | TEXT | Priority level (none, low, medium, high) |
| `tags` | TEXT[] | Array of tags |
| `notes` | TEXT | Long-form notes |
| `due_date` | TIMESTAMPTZ | When due (optional) |
| `reminder_time` | TIMESTAMPTZ | When to send reminder (optional) |
| `location_name` | TEXT | Location name for reminder |
| `location_lat` | NUMERIC(10,8) | Latitude for geo-reminder |
| `location_lng` | NUMERIC(11,8) | Longitude for geo-reminder |
| `location_radius` | INTEGER | Reminder radius in meters (default: 100) |
| `recurrence_rule` | TEXT | Recurrence pattern (daily, weekly, monthly) |
| `recurrence_parent_id` | UUID | Parent recurring todo (self-reference) |
| `attachments` | JSONB | Array of file attachments |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | Last updated (auto-updated) |

**Indexes:**
- Primary key on `id`
- Index on `user_id` (for user queries)
- Index on `list_id` (for list queries)
- Index on `is_public` (for public todo queries)
- Index on `position` (for sorting)
- Index on `due_date` (for reminder queries)
- Index on `recurrence_rule` (for recurring task queries)

**Check Constraints:**
- `priority` must be one of: 'none', 'low', 'medium', 'high'

**Foreign Keys:**
- `user_id` → `auth.users.id` ON DELETE CASCADE
- `list_id` → `app_lists.id` ON DELETE CASCADE
- `recurrence_parent_id` → `app_todos.id` ON DELETE CASCADE

**Triggers:**
- Auto-updates `updated_at` on changes

**Example:**
```graphql
mutation {
  insert_app_todos_one(object: {
    title: "Buy milk"
    list_id: "uuid-here"
    priority: "high"
    tags: ["groceries", "urgent"]
    notes: "Get organic whole milk"
    due_date: "2026-02-13T18:00:00Z"
    location_name: "Whole Foods"
    location_lat: 37.7749
    location_lng: -122.4194
    location_radius: 100
    attachments: [{
      id: "file-1"
      name: "shopping-list.pdf"
      url: "https://storage.../file.pdf"
      type: "application/pdf"
      size: 1024
    }]
  }) {
    id
    title
    priority
    tags
    due_date
  }
}
```

---

### `app_list_shares`

List-level sharing with granular permissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `list_id` | UUID | Shared list (references app_lists.id) |
| `shared_with_user_id` | UUID | User receiving access (references auth.users.id) |
| `shared_with_email` | TEXT | Email address (for invite system) |
| `permission` | TEXT | Permission level (owner, editor, viewer) |
| `invited_by` | UUID | User who created the share (references auth.users.id) |
| `accepted_at` | TIMESTAMPTZ | When invite accepted (NULL = pending) |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | Last updated (auto-updated) |

**Indexes:**
- Primary key on `id`
- Index on `list_id` (for list queries)
- Index on `shared_with_email` (for invite lookups)

**Unique Constraints:**
- UNIQUE(list_id, shared_with_email) - One share per email per list

**Foreign Keys:**
- `list_id` → `app_lists.id` ON DELETE CASCADE
- `shared_with_user_id` → `auth.users.id` ON DELETE CASCADE
- `invited_by` → `auth.users.id` ON DELETE CASCADE

**Permissions (RLS):**
- Only list owners can create/modify shares
- Users can view shares for lists they own or are shared with

**Triggers:**
- Auto-updates `updated_at` on changes

**Example:**
```graphql
mutation {
  insert_app_list_shares_one(object: {
    list_id: "uuid-here"
    shared_with_email: "friend@example.com"
    permission: "editor"
  }) {
    id
    shared_with_email
    permission
    accepted_at
  }
}
```

---

### `app_list_presence`

Real-time presence tracking for collaborative editing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `list_id` | UUID | List being viewed (references app_lists.id) |
| `user_id` | UUID | User currently viewing (references auth.users.id) |
| `status` | TEXT | Current status (viewing, editing) |
| `editing_todo_id` | UUID | Todo being edited (references app_todos.id, optional) |
| `last_seen_at` | TIMESTAMPTZ | Heartbeat timestamp |
| `created_at` | TIMESTAMPTZ | When joined |

**Indexes:**
- Primary key on `id`
- Index on `list_id` (for presence queries)
- Index on `last_seen_at` (for cleanup queries)

**Unique Constraints:**
- UNIQUE(list_id, user_id) - One presence record per user per list

**Foreign Keys:**
- `list_id` → `app_lists.id` ON DELETE CASCADE
- `user_id` → `auth.users.id` ON DELETE CASCADE
- `editing_todo_id` → `app_todos.id` ON DELETE SET NULL

**Check Constraints:**
- `status` must be one of: 'viewing', 'editing'

**Triggers:**
- Auto-updated via `upsert_presence()` function (heartbeat every 30s)

**Example:**
```graphql
mutation {
  upsert_presence(
    list_id: "uuid-here"
    user_id: "uuid-here"
    status: "editing"
    editing_todo_id: "uuid-here"
  )
}
```

---

### `app_notifications`

In-app notification center.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Recipient (references auth.users.id) |
| `type` | TEXT | Notification type (new_todo, due_reminder, etc.) |
| `title` | TEXT | Notification title |
| `body` | TEXT | Notification message |
| `data` | JSONB | Additional metadata |
| `read` | BOOLEAN | Read status (default: false) |
| `action_url` | TEXT | Optional URL to navigate to |
| `created_at` | TIMESTAMPTZ | When created |

**Indexes:**
- Primary key on `id`
- Index on `user_id` (for user notifications)

**Foreign Keys:**
- `user_id` → `auth.users.id` ON DELETE CASCADE

**Notification Types:**
1. `new_todo` - New todo assigned
2. `due_reminder` - Todo due soon
3. `shared_list` - List shared with you
4. `evening_reminder` - Daily digest at 8pm
5. `location_reminder` - Arrived at list location
6. `list_update` - Collaborator updated list

**Example:**
```graphql
query {
  app_notifications(
    where: { user_id: { _eq: "uuid" }, read: { _eq: false } }
    order_by: { created_at: desc }
  ) {
    id
    type
    title
    body
    data
    action_url
    created_at
  }
}
```

---

### `app_recurring_instances`

Tracks completion of recurring todo instances.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `parent_todo_id` | UUID | Parent recurring todo (references app_todos.id) |
| `instance_date` | DATE | Date of this instance (YYYY-MM-DD) |
| `completed` | BOOLEAN | Completion status for this instance |
| `completed_at` | TIMESTAMPTZ | When completed |
| `created_at` | TIMESTAMPTZ | When created |

**Indexes:**
- Primary key on `id`
- Index on `parent_todo_id` (for instance lookups)

**Unique Constraints:**
- UNIQUE(parent_todo_id, instance_date) - One instance per date

**Foreign Keys:**
- `parent_todo_id` → `app_todos.id` ON DELETE CASCADE

**Example:**
```graphql
query {
  app_recurring_instances(
    where: {
      parent_todo_id: { _eq: "uuid" }
      instance_date: { _eq: "2026-02-12" }
    }
  ) {
    id
    instance_date
    completed
    completed_at
  }
}
```

---

### `app_todo_shares` (Legacy)

Legacy todo-level sharing. **Deprecated** in favor of list-level sharing.

Kept for backward compatibility. New features should use `app_list_shares` instead.

---

## Database Functions

### `set_updated_at()`

Auto-updates `updated_at` timestamp on table changes.

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied to: `app_profiles`, `app_todos`, `app_lists`, `app_list_shares`

---

### `upsert_presence()`

Upserts presence record with heartbeat update.

```sql
CREATE FUNCTION upsert_presence(
  p_list_id UUID,
  p_user_id UUID,
  p_status TEXT,
  p_editing_todo_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO app_list_presence (list_id, user_id, status, editing_todo_id, last_seen_at)
  VALUES (p_list_id, p_user_id, p_status, p_editing_todo_id, now())
  ON CONFLICT (list_id, user_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    editing_todo_id = EXCLUDED.editing_todo_id,
    last_seen_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies use `auth.uid()` to identify current user.

### `app_lists` Policies:
- Users can SELECT their own lists + shared lists
- Users can INSERT/UPDATE/DELETE only their own lists

### `app_todos` Policies:
- Users can SELECT todos in accessible lists
- Users can INSERT/UPDATE todos in lists where they have editor+ permission
- Users can DELETE only their own todos

### `app_list_shares` Policies:
- Only list owners can INSERT/UPDATE/DELETE shares
- Users can SELECT shares for accessible lists

### `app_list_presence` Policies:
- Users can SELECT presence for accessible lists
- Users can UPSERT their own presence

---

## Schema Diagram

```
┌─────────────────┐
│  auth.users     │
└────────┬────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│  app_profiles   │                    │   app_lists     │
│                 │                    │                 │
│  • email        │                    │  • title        │
│  • display_name │                    │  • color        │
│  • avatar_url   │                    │  • icon         │
│  • preferences  │                    │  • location     │
└─────────────────┘                    └────────┬────────┘
                                                │
                       ┌────────────────────────┼────────────────────────┐
                       │                        │                        │
                       ▼                        ▼                        ▼
              ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
              │   app_todos     │     │ app_list_shares │     │app_list_presence│
              │                 │     │                 │     │                 │
              │  • title        │     │  • permission   │     │  • status       │
              │  • priority     │     │  • email        │     │  • editing_todo │
              │  • tags         │     │  • accepted_at  │     │  • last_seen    │
              │  • due_date     │     └─────────────────┘     └─────────────────┘
              │  • location     │
              │  • recurring    │
              │  • attachments  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │app_recurring_   │
              │   instances     │
              │                 │
              │  • instance_date│
              │  • completed    │
              └─────────────────┘


┌─────────────────┐
│app_notifications│
│                 │
│  • type         │
│  • title        │
│  • body         │
│  • read         │
└─────────────────┘
```

---

## Migration Path

From simple todos → collaborative lists:

1. ✅ Create `app_lists` table
2. ✅ Add `list_id` to `app_todos`
3. ✅ Create default list for each user
4. ✅ Move todos to default lists
5. ✅ Add new tables: shares, presence, notifications, recurring
6. ✅ Apply RLS policies

---

## Performance Optimization

- **Indexes** on all foreign keys and query columns
- **Partial indexes** on `due_date` and `recurrence_rule` (WHERE NOT NULL)
- **GIN index** on `tags` array (if needed)
- **BRIN index** on `created_at` (for time-series queries)
- **Connection pooling** via Hasura (default: 2 connections per replica)

---

## Backup & Restore

```bash
# Backup
docker exec nself-postgres pg_dump -U postgres nself > backup.sql

# Restore
docker exec -i nself-postgres psql -U postgres nself < backup.sql
```

---

**Last Updated**: 2026-02-12
**Schema Version**: 2.0 (Collaborative Lists)
