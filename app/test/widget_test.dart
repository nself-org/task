// Basic Flutter widget test for ɳTasks app.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:ntasks/app.dart';

void main() {
  testWidgets('NTasksApp renders without crashing', (WidgetTester tester) async {
    // Build the app wrapped in ProviderScope (required by Riverpod).
    await tester.pumpWidget(const ProviderScope(child: NTasksApp()));

    // The app should render and show a progress indicator while loading auth state.
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
