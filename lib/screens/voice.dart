import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:universal_html/html.dart' as html;
import 'dart:ui_web' as ui;

import 'package:test_hh/screens/chat.dart';
import 'package:test_hh/constants/urls.dart';

class VoiceScreen extends StatefulWidget {
  final ChatSession chatSession;

  const VoiceScreen({
    super.key,
    required this.chatSession,
  });

  @override
  State<VoiceScreen> createState() => _VoiceScreenState();
}

class _VoiceScreenState extends State<VoiceScreen> {
  WebViewController? _controller;
  late final String _url;
  late final String _viewId;

  @override
  void initState() {
    super.initState();

    final s = widget.chatSession;

    print("widget.chatSession.clientName :");
    print(widget.chatSession.clientName);

    final roomID = '${s.coachId}${s.clientId}';

    final userID =
        s.role == 'coach'
            ? "2" + s.coachId.toString()
            : "1" + s.clientId.toString();

    final username =
        s.role == 'coach'
            ? s.coachName
            : s.clientName;

    final image = s.clientImage ?? '';

    final _url =
        '$kBaseUrl'
        '?roomID=$roomID'
        '&userID=$userID'
        '&username=${Uri.encodeComponent(username ?? "Unknown")}'
        '${s.role == 'coach' ? '' : '&image=${Uri.encodeComponent(image ?? "")}'}';

    print("VoiceScreen");
    print(s.role);
    print(_url);

    if (kIsWeb) {
      _viewId = 'voice-${DateTime.now().millisecondsSinceEpoch}';

      ui.platformViewRegistry.registerViewFactory(
        _viewId,
        (int viewId) {
          final iframe = html.IFrameElement()
            ..src = _url
            ..style.border = 'none'
            ..style.position = 'fixed'
            ..style.top = '0'
            ..style.left = '0'
            ..style.width = '100%'
            ..style.height = '100%'
            ..style.margin = '0'
            ..style.padding = '0'
            ..allow = 'camera; microphone';

          return iframe;
        },
      );
    } else {
      _controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..loadRequest(Uri.parse(_url));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Voice Call'),
      ),
      body: SizedBox.expand(
        child: kIsWeb
            ? HtmlElementView(viewType: _viewId)
            : WebViewWidget(controller: _controller!),
      ),
    );
  }
}