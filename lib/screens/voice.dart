import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:universal_html/html.dart' as html;
import 'package:permission_handler/permission_handler.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'package:test_hh/constants/urls.dart';
import 'package:test_hh/models/chatSession.dart';

import '../stub/ui_web_stub.dart'
if (dart.library.html) 'dart:ui_web' as ui;

class VoiceScreen extends StatefulWidget {
  final ChatSession chatSession;

  const VoiceScreen({super.key, required this.chatSession});

  @override
  State<VoiceScreen> createState() => _VoiceScreenState();
}

class _VoiceScreenState extends State<VoiceScreen> {
  WebViewController? _controller;
  late final String _viewId;

  @override
  void initState() {
    super.initState();

    if (!kIsWeb) {
      _requestPermissions();
    }

    final s = widget.chatSession;

    print("widget.chatSession.clientName :");
    print(widget.chatSession.clientName);

    final roomID = '${s.coachId}${s.clientId}';

    final userID = s.role == 'coach'
        ? "2" + s.coachId.toString()
        : "1" + s.clientId.toString();

    final username = s.role == 'coach' ? s.coachName : s.clientName;

    final image = s.clientImage ?? '';

    final _url =
        '$kBaseUrl'
        '?roomID=$roomID'
        '&userID=$userID'
        '&username=${Uri.encodeComponent(username ?? "Unknown")}'
        '${s.role == 'coach' ? '' : '&image=${Uri.encodeComponent(image)}'}';

    print("VoiceScreen");
    print(s.role);
    print(_url);

    if (kIsWeb) {
      _viewId = 'voice-${DateTime.now().millisecondsSinceEpoch}';

      ui.platformViewRegistry.registerViewFactory(_viewId, (int viewId) {
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
      });
    } else {
      _controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(Colors.black)
        ..setNavigationDelegate(NavigationDelegate(
          onPageFinished: (url) => print("Page loaded: $url"),
          onWebResourceError: (error) => print("WebView error: $error"),
        ))
        ..loadRequest(
          Uri.parse(_url),
          headers: {'Accept': '*/*'},
        );

      if (_controller!.platform is AndroidWebViewController) {
        AndroidWebViewController.enableDebugging(true);
        (_controller!.platform as AndroidWebViewController)
            .setMediaPlaybackRequiresUserGesture(false);
        (_controller!.platform as AndroidWebViewController).setOnPlatformPermissionRequest((request) {
          request.grant();
        });
      }
    }
  }

  Future<void> _requestPermissions() async {
    await [
      Permission.camera,
      Permission.microphone,
    ].request();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          SizedBox.expand(
            child: kIsWeb
                ? HtmlElementView(viewType: _viewId)
                : WebViewWidget(controller: _controller!),
          ),
          Positioned(
            top: 40,
            right: 20,
            child: SafeArea(
              child: Material(
                color: Colors.red,
                shape: const CircleBorder(),
                elevation: 6,
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: () {
                    Navigator.pop(context);
                  },
                  child: const Padding(
                    padding: EdgeInsets.all(14),
                    child: Icon(Icons.call_end, color: Colors.white, size: 28),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}