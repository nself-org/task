import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../l10n/app_localizations.dart';
import '../providers/auth_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String? _serverUrl;
  String _themeMode = 'system';

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    final url = await ref.read(backendServiceProvider).getServerUrl();
    final prefs = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        _serverUrl = url;
        _themeMode = prefs.getString('theme_mode') ?? 'system';
      });
    }
  }

  Future<void> _editServerUrl(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;
    final ctrl = TextEditingController(text: _serverUrl ?? '');
    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.editServerUrl),
        content: TextField(
          controller: ctrl,
          decoration: InputDecoration(
            labelText: l10n.serverUrl,
            hintText: 'https://your-nself-server.com',
            border: const OutlineInputBorder(),
          ),
          keyboardType: TextInputType.url,
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.save),
          ),
        ],
      ),
    );
    if (saved != true || !mounted) return;
    final newUrl = ctrl.text.trim();
    if (newUrl.isEmpty) return;
    await ref.read(backendServiceProvider).setServerUrl(newUrl);
    if (!mounted) return;
    setState(() => _serverUrl = newUrl);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.serverUrlSaved)),
    );
  }

  Future<void> _setThemeMode(String mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme_mode', mode);
    if (mounted) setState(() => _themeMode = mode);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final auth = ref.watch(authStateProvider);
    final email = auth.when(
      data: (user) => user?['email'] as String? ?? '',
      loading: () => '',
      error: (_, __) => '',
    );

    return Scaffold(
      appBar: AppBar(title: Text(l10n.settings)),
      body: ListView(
        children: [
          // ── Server ─────────────────────────────────────────────────────
          _SectionHeader(label: l10n.serverUrl),
          ListTile(
            leading: const Icon(Icons.dns_outlined),
            title: Text(l10n.serverUrl),
            subtitle: Text(
              _serverUrl?.isNotEmpty == true ? _serverUrl! : '—',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            trailing: const Icon(Icons.edit_outlined),
            onTap: () => _editServerUrl(context),
          ),
          const Divider(height: 1),

          // ── Account ────────────────────────────────────────────────────
          _SectionHeader(label: l10n.account),
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: Text(l10n.signedInAs),
            subtitle: Text(
              email.isNotEmpty ? email : '—',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ),
          const Divider(height: 1),

          // ── Appearance ─────────────────────────────────────────────────
          _SectionHeader(label: l10n.theme),
          _ThemeOption(
            icon: Icons.brightness_auto_outlined,
            label: l10n.themeSystem,
            selected: _themeMode == 'system',
            onTap: () => _setThemeMode('system'),
          ),
          _ThemeOption(
            icon: Icons.light_mode_outlined,
            label: l10n.themeLight,
            selected: _themeMode == 'light',
            onTap: () => _setThemeMode('light'),
          ),
          _ThemeOption(
            icon: Icons.dark_mode_outlined,
            label: l10n.themeDark,
            selected: _themeMode == 'dark',
            onTap: () => _setThemeMode('dark'),
          ),
          const Divider(height: 1),

          // ── About ──────────────────────────────────────────────────────
          _SectionHeader(label: l10n.about),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('ɳTasks'),
            subtitle: Text(l10n.aboutDescription),
          ),
          ListTile(
            leading: const Icon(Icons.tag),
            title: Text(l10n.appVersion),
            trailing: const Text('0.1.0'),
          ),
          const Divider(height: 1),

          // ── Sign out ───────────────────────────────────────────────────
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: FilledButton.tonal(
              onPressed: () =>
                  ref.read(authNotifierProvider.notifier).signOut(),
              style: FilledButton.styleFrom(
                backgroundColor:
                    theme.colorScheme.errorContainer.withValues(alpha: 0.5),
                foregroundColor: theme.colorScheme.error,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.logout, size: 18),
                  const SizedBox(width: 8),
                  Text(l10n.signOut),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Theme option tile ──────────────────────────────────────────────────────────

class _ThemeOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _ThemeOption({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(label),
      trailing: selected ? const Icon(Icons.check) : null,
      onTap: onTap,
    );
  }
}

// ── Section header ─────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String label;
  const _SectionHeader({required this.label});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 4),
      child: Text(
        label.toUpperCase(),
        style: theme.textTheme.labelSmall?.copyWith(
          color: theme.colorScheme.primary,
          letterSpacing: 0.8,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
