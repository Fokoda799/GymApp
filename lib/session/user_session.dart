import 'package:test_hh/services/apiService.dart';

class UserSession {
  UserSession._();
  static final UserSession instance = UserSession._();

  Map<String, dynamic>? _raw;
  int get id => _raw?['id'] ?? 0;
  String get name => _raw?['name'] ?? '';
  String get email => _raw?['email'] ?? '';
  String get role => _raw?['role'] ?? 'client';
  String get gender => _raw?['gender'] ?? '';
  String get image => _raw?['image'] ?? '';
  String get birth => _raw?['birth'] ?? '';
  double get weight => (_raw?['weight'] as num?)?.toDouble() ?? 0;
  double get height => (_raw?['height'] as num?)?.toDouble() ?? 0;
  int get frequency => (_raw?['frequency'] as num?)?.toInt() ?? 0;
  String get goal => _raw?['goal'] ?? '';
  double get weightGoal => (_raw?['weightGoal'] as num?)?.toDouble() ?? 0;
  int? get coachID => _raw?['coachID'];

  bool get isLoaded => _raw != null;
  bool get isCoach => role == 'coach';
  bool get isClient => role == 'client';

  Future<bool> load() async {
    final result = await ApiService.getMe();

    if (result['success'] == true) {
      final raw =
          result['coach'] ?? result['client'] ?? result['user'] ?? result;
      _raw = Map<String, dynamic>.from(raw as Map);
      _raw!['role'] = result['role'] ?? 'coach';

      print('=== BEFORE PARSE: ${_raw}');
      print('=== id field: ${_raw!['id']} (type: ${_raw!['id'].runtimeType})');

      final rawId = _raw!['id'];
      if (rawId is String) _raw!['id'] = int.tryParse(rawId) ?? 0;

      print('id: $id, role: $role, name: $name');
      return id > 0;
    }
    return false;
  }

  void clear() => _raw = null;

  dynamic operator [](String key) => _raw?[key];
}
