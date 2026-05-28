import 'package:flutter/material.dart';
import 'package:test_hh/constants/colors.dart';
import 'package:test_hh/constants/names.dart';
import 'package:test_hh/screens/profileClient.dart';
import 'package:test_hh/screens/profileCoach.dart';
import 'package:test_hh/screens/chat.dart';
import 'package:test_hh/screens/coachConv.dart';
import 'package:test_hh/models/chatSession.dart';
import 'package:test_hh/screens/program.dart';
import 'package:test_hh/services/apiService.dart';

class Header extends StatefulWidget implements PreferredSizeWidget {
  const Header({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(62);

  @override
  State<Header> createState() => _HeaderState();
}

class _HeaderState extends State<Header> {
  bool _chatLoading = false;
  String? _userImageUrl;
  bool _isLoadingImage = true;
  bool _showChatButton = false;
  bool _showProgramButton = false;
  bool _isClient = false;

  @override
  void initState() {
    super.initState();
    _loadUserImage();
    _checkChatAvailability();
  }

  Future<void> _checkChatAvailability() async {
    try {
      final role = await ApiService.getUserRole();

      if (role == 'coach') {
        if (mounted) {
          setState(() {
            _showChatButton = true;
            _showProgramButton = false;
            _isClient = false;
          });
        }
      } 
      else if (role == 'client') {
        final data = await ApiService.getMe();
        if (data['success'] == true) {
          final user = data['user'] ?? data['client'];
          final coach = user?['coach'] as Map<String, dynamic>?;

          if (mounted) {
            setState(() {
              _showChatButton = coach != null && coach['id'] != null;
              _showProgramButton = coach != null && coach['id'] != null;
              _isClient = true;
            });
          }
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _showChatButton = false;
          _showProgramButton = false;
        });
      }
    }
  }

  Future<void> _loadUserImage() async {
    setState(() => _isLoadingImage = true);
    try {
      final role = await ApiService.getUserRole();
      if (role == 'client') {
        final data = await ApiService.getMe();
        if (data['success'] == true) {
          final user = data['client'] ?? data['user'];
          if (user != null) {
            setState(() => _userImageUrl = user['image'] as String?);
          }
        }
      } else if (role == 'coach') {
        final data = await ApiService.getMyCoachProfile();
        if (data['success'] == true) {
          final coach = data['coach'] as Map<String, dynamic>?;
          if (coach != null) {
            setState(() => _userImageUrl = coach['image'] as String?);
          }
        }
      }
    } catch (e) {
      // Ignorer l'erreur
    } finally {
      if (mounted) setState(() => _isLoadingImage = false);
    }
  }

  Future<void> _onChatTap() async {
    if (_chatLoading) return;

    final role = await ApiService.getUserRole();
    if (role == null) {
      _showSnack('Veuillez vous connecter pour accéder au chat.');
      return;
    }

    setState(() => _chatLoading = true);
    try {
      if (role == 'client') {
        await _navigateAsClient();
      } else if (role == 'coach') {
        await _navigateAsCoach();
      }
    } finally {
      if (mounted) setState(() => _chatLoading = false);
    }
  }

  Future<void> _onProgramTap() async {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProgramScreen()
      ),
    );
  }

  Future<void> _navigateAsClient() async {
    final data = await ApiService.getMe();
    if (data['success'] != true) {
      _showSnack('Impossible de récupérer votre profil.');
      return;
    }

    final user = data['user'] ?? data['client'] as Map<String, dynamic>?;
    final clientId = user?['id'] as int?;
    final clientImage = user?['image'] as String?;
    final clientName = user?['name'] as String?;
    final coach = user?['coach'] as Map<String, dynamic>?;
    final coachId = coach?['id'] as int?;
    final coachName = (coach?['name'] as String?) ?? 'Mon Coach';

    if (clientId == null || coachId == null) {
      _showSnack('Aucun coach assigné à votre compte.');
      return;
    }

    if (!mounted) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChatScreen(
          session: ChatSession(
            coachId: coachId,
            coachName: coachName,
            coachInitials: _initials(coachName),
            clientId: clientId,
            clientImage: clientImage,
            clientName: clientName,
            role: 'client',
          ),
        ),
      ),
    );
  }

  Future<void> _navigateAsCoach() async {
    final data = await ApiService.getMyCoachProfile();
    if (data['success'] != true) {
      _showSnack('Impossible de récupérer votre profil coach.');
      return;
    }

    final coach = data['coach'] as Map<String, dynamic>?;
    final coachId = coach?['id'] as int?;
    final coachName = (coach?['name'] as String?) ?? 'Coach';

    if (coachId == null) {
      _showSnack('Impossible de récupérer votre identifiant.');
      return;
    }

    if (!mounted) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CoachConversationsScreen(
          coachId: coachId,
          coachName: coachName,
        ),
      ),
    );
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red.shade800),
    );
  }

  static String _initials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    if (parts[0].length >= 2) return parts[0].substring(0, 2).toUpperCase();
    return parts[0][0].toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
      child: SafeArea(
        bottom: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                if (_showProgramButton) _buildProgramButton(),
                const SizedBox(width: 10),
                if (_showChatButton) _buildChatButton()
                else if (!_isClient)
                  const SizedBox(width: 42),
              ],
            ),
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: gymName.split(" ")[0],
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 3,
                    ),
                  ),
                  TextSpan(
                    text: gymName.split(" ")[1],
                    style: const TextStyle(
                      color: kNeonGreen,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 3,
                    ),
                  ),
                ],
              ),
            ),

            _buildAvatar(context),
          ],
        ),
      ),
    );
  }

  Widget _buildProgramButton() {
    return GestureDetector(
      onTap: _onProgramTap,
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: kDarkCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white12, width: 1),
        ),
        child: const Icon(
          Icons.calendar_month,
          color: Colors.white,
          size: 20,
        ),
      ),
    );
  }

  Widget _buildChatButton() {
    return GestureDetector(
      onTap: _onChatTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: kDarkCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white12, width: 1),
            ),
            child: _chatLoading
                ? const Padding(
                    padding: EdgeInsets.all(11),
                    child: CircularProgressIndicator(
                        color: kNeonGreen, strokeWidth: 2),
                  )
                : const Icon(Icons.chat_bubble_outline,
                    color: Colors.white, size: 20),
          ),
          if (!_chatLoading)
            Positioned(
              top: -3,
              right: -3,
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: kNeonGreen,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: kNeonGreen.withOpacity(0.7),
                      blurRadius: 6,
                      spreadRadius: 1,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAvatar(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final role = await ApiService.getUserRole();
        if (role == 'client') {
          Navigator.push(context,
              MaterialPageRoute(builder: (_) => const ProfileClient()));
        } else if (role == 'coach') {
          Navigator.push(context,
              MaterialPageRoute(builder: (_) => const ProfileCoach()));
        } else {
          _showSnack('Veuillez vous connecter pour accéder au profil.');
        }
      },
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: kNeonGreen, width: 2),
          boxShadow: [
            BoxShadow(
              color: kNeonGreen.withOpacity(0.5),
              blurRadius: 10,
              spreadRadius: 1,
            ),
          ],
        ),
        child: ClipOval(
          child: _isLoadingImage
              ? Container(
                  color: Colors.grey[800],
                  child: const Center(
                      child: CircularProgressIndicator(
                          color: kNeonGreen, strokeWidth: 2)),
                )
              : (_userImageUrl != null && _userImageUrl!.isNotEmpty
                  ? Image.network(
                      _userImageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: Colors.grey[800],
                        child: const Icon(Icons.person,
                            color: Colors.white, size: 22),
                      ),
                      loadingBuilder: (_, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          color: Colors.grey[800],
                          child: const Center(
                              child: CircularProgressIndicator(
                                  color: kNeonGreen, strokeWidth: 2)),
                        );
                      },
                    )
                  : Container(
                      color: Colors.grey[800],
                      child: const Icon(Icons.person,
                          color: Colors.white, size: 22),
                    )),
        ),
      ),
    );
  }
}