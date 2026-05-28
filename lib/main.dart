import 'package:flutter/material.dart';
import 'package:test_hh/screens/clients.dart';
import 'package:test_hh/screens/home.dart';
import 'package:test_hh/screens/welcome.dart';
import 'package:test_hh/session/user_session.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await UserSession.instance.load(); 
  runApp(const GymApp());
}

class GymApp extends StatelessWidget {
  const GymApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.black,
      ),
      home: UserSession.instance.isLoaded ? (
        UserSession.instance.role == 'client' ? const HomeScreen() : const ClientsScreen()
      ) : const WelcomeScreen(),
    );
  }
}