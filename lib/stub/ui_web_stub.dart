class _PlatformViewRegistry {
  void registerViewFactory(String viewId, dynamic Function(int) factory) {}
}

final platformViewRegistry = _PlatformViewRegistry();