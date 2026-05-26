class ChatSession {
  final int coachId;
  final String coachName;
  final String coachInitials;
  final int clientId;
  final String? clientImage;
  final String? clientName;
  final String clientInitials;
  final String role;

  const ChatSession({
    required this.coachId,
    required this.coachName,
    required this.coachInitials,
    required this.clientId,
    required this.clientImage,
    required this.role,
    this.clientName = 'Client',
    this.clientInitials = 'C',
  });
}