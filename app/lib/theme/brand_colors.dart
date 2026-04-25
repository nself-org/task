/// nSelf shared brand color tokens.
///
/// All nSelf apps use sky-500 (#0ea5e9) as the primary brand color,
/// consistent with the nSelf Design System (UD #7 default — P96 2026-04-24).
library;

import 'package:flutter/material.dart';

/// Shared brand color constants for all nSelf apps.
class NselfBrandColors {
  NselfBrandColors._();

  /// Primary brand color — sky-500 (#0EA5E9).
  static const Color primary = Color(0xFF0EA5E9);

  /// Lighter primary — sky-400.
  static const Color primaryHover = Color(0xFF38BDF8);

  /// Dark background — gray-950.
  static const Color background = Color(0xFF030712);
}
