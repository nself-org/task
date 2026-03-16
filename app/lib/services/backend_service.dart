import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import '../models/task_list.dart';
import '../models/task.dart';

/// Backend service — communicates with the nSelf backend (Hasura GraphQL + Nhost Auth).
/// Server URL is configured by the user (self-hosted nSelf instance).
class BackendService {
  static const _storage = FlutterSecureStorage();
  static const _serverUrlKey = 'server_url';
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  // ── Server URL ─────────────────────────────────────────────────────────────

  Future<String?> getServerUrl() => _storage.read(key: _serverUrlKey);

  Future<void> setServerUrl(String url) =>
      _storage.write(key: _serverUrlKey, value: url.trimRight().replaceAll(RegExp(r'/$'), ''));

  // ── Auth ────────────────────────────────────────────────────────────────────

  Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);

  Future<Map<String, dynamic>?> signIn(String serverUrl, String email, String password) async {
    final uri = Uri.parse('$serverUrl/v1/auth/signin/email-password');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode != 200) return null;
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final session = data['session'] as Map<String, dynamic>?;
    if (session == null) return null;
    await _storage.write(key: _accessTokenKey, value: session['accessToken'] as String);
    await _storage.write(key: _refreshTokenKey, value: session['refreshToken'] as String);
    await setServerUrl(serverUrl);
    return data['user'] as Map<String, dynamic>?;
  }

  Future<bool> requestPasswordReset(String serverUrl, String email) async {
    final uri = Uri.parse('$serverUrl/v1/auth/email/send-password-reset-email');
    try {
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<void> signOut() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    final serverUrl = await getServerUrl();
    final token = await getAccessToken();
    if (serverUrl == null || token == null) return null;
    final response = await http.get(
      Uri.parse('$serverUrl/v1/auth/user'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode != 200) return null;
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ── GraphQL ─────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>?> _graphql(String query, [Map<String, dynamic>? variables]) async {
    final serverUrl = await getServerUrl();
    final token = await getAccessToken();
    if (serverUrl == null || token == null) return null;
    final response = await http.post(
      Uri.parse('$serverUrl/v1/graphql'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'query': query, 'variables': variables}),
    );
    if (response.statusCode != 200) return null;
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    return body['data'] as Map<String, dynamic>?;
  }

  // ── Lists ───────────────────────────────────────────────────────────────────

  Future<List<TaskList>> getLists() async {
    const query = '''
      query GetLists {
        app_lists(order_by: {position: asc}) {
          id title description color position owner_id created_at updated_at
        }
      }
    ''';
    final data = await _graphql(query);
    if (data == null) return [];
    return (data['app_lists'] as List<dynamic>)
        .map((e) => TaskList.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<TaskList?> createList(String title, {String color = '#6366F1'}) async {
    const mutation = '''
      mutation CreateList(\$title: String!, \$color: String!) {
        insert_app_lists_one(object: {title: \$title, color: \$color, position: 0}) {
          id title description color position owner_id created_at updated_at
        }
      }
    ''';
    final data = await _graphql(mutation, {'title': title, 'color': color});
    if (data == null) return null;
    return TaskList.fromJson(data['insert_app_lists_one'] as Map<String, dynamic>);
  }

  Future<TaskList?> updateList(String listId, {String? title, String? color}) async {
    const mutation = '''
      mutation UpdateList(\$id: uuid!, \$title: String, \$color: String) {
        update_app_lists_by_pk(pk_columns: {id: \$id}, _set: {title: \$title, color: \$color}) {
          id title description color position owner_id created_at updated_at
        }
      }
    ''';
    final data = await _graphql(mutation, {'id': listId, 'title': title, 'color': color});
    if (data == null) return null;
    return TaskList.fromJson(data['update_app_lists_by_pk'] as Map<String, dynamic>);
  }

  Future<bool> deleteList(String listId) async {
    const mutation = '''
      mutation DeleteList(\$id: uuid!) {
        delete_app_lists_by_pk(id: \$id) { id }
      }
    ''';
    final data = await _graphql(mutation, {'id': listId});
    return data != null;
  }

  // ── Tasks ───────────────────────────────────────────────────────────────────

  Future<List<Task>> getTasks(String listId) async {
    const query = '''
      query GetTasks(\$listId: uuid!) {
        app_tasks(where: {list_id: {_eq: \$listId}}, order_by: {position: asc}) {
          id title description completed due_date list_id assignee_id position tags created_at updated_at
        }
      }
    ''';
    final data = await _graphql(query, {'listId': listId});
    if (data == null) return [];
    return (data['app_tasks'] as List<dynamic>)
        .map((e) => Task.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Task?> createTask(String listId, String title) async {
    const mutation = '''
      mutation CreateTask(\$listId: uuid!, \$title: String!) {
        insert_app_tasks_one(object: {list_id: \$listId, title: \$title, completed: false, position: 0}) {
          id title description completed due_date list_id assignee_id position tags created_at updated_at
        }
      }
    ''';
    final data = await _graphql(mutation, {'listId': listId, 'title': title});
    if (data == null) return null;
    return Task.fromJson(data['insert_app_tasks_one'] as Map<String, dynamic>);
  }

  Future<bool> toggleTask(String taskId, bool completed) async {
    const mutation = '''
      mutation ToggleTask(\$id: uuid!, \$completed: Boolean!) {
        update_app_tasks_by_pk(pk_columns: {id: \$id}, _set: {completed: \$completed}) { id }
      }
    ''';
    final data = await _graphql(mutation, {'id': taskId, 'completed': completed});
    return data != null;
  }

  Future<Task?> updateTask(
    String taskId, {
    String? title,
    String? description,
    bool? completed,
    DateTime? dueDate,
    bool clearDueDate = false,
    List<String>? tags,
    String? priority,
  }) async {
    const mutation = '''
      mutation UpdateTask(
        \$id: uuid!,
        \$title: String,
        \$description: String,
        \$completed: Boolean,
        \$due_date: timestamptz,
        \$tags: jsonb,
        \$priority: String
      ) {
        update_app_tasks_by_pk(
          pk_columns: {id: \$id},
          _set: {
            title: \$title,
            description: \$description,
            completed: \$completed,
            due_date: \$due_date,
            tags: \$tags,
            priority: \$priority
          }
        ) {
          id title description completed due_date list_id assignee_id position tags priority created_at updated_at
        }
      }
    ''';
    final variables = <String, dynamic>{'id': taskId};
    if (title != null) variables['title'] = title;
    if (description != null) variables['description'] = description;
    if (completed != null) variables['completed'] = completed;
    if (clearDueDate) {
      variables['due_date'] = null;
    } else if (dueDate != null) {
      variables['due_date'] = dueDate.toIso8601String();
    }
    if (tags != null) variables['tags'] = tags;
    if (priority != null) variables['priority'] = priority;

    final data = await _graphql(mutation, variables);
    if (data == null) return null;
    return Task.fromJson(data['update_app_tasks_by_pk'] as Map<String, dynamic>);
  }

  Future<bool> deleteTask(String taskId) async {
    const mutation = '''
      mutation DeleteTask(\$id: uuid!) {
        delete_app_tasks_by_pk(id: \$id) { id }
      }
    ''';
    final data = await _graphql(mutation, {'id': taskId});
    return data != null;
  }
}
