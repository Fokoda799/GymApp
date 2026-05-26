import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:test_hh/constants/urls.dart';
import 'package:test_hh/models/client.dart';

class InviteService {
  static Future<List<Client>> fetchInvites(int coachID) async {
    final response =
        await http.get(Uri.parse('$kBaseUrl/api/invite/coach/$coachID'));
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((j) => Client.fromJson(j)).toList();
    }
    throw Exception(
        'Impossible de charger les invitations (${response.statusCode})');
  }

  static Future<void> acceptInvite(
      {required int coachID, required int clientID}) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/api/invite/accept'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'coachID': coachID, 'clientID': clientID}),
    );
    if (response.statusCode != 200) {
      throw Exception('Échec de l\'acceptation (${response.statusCode})');
    }
  }

  static Future<void> refuseInvite(
      {required int coachID, required int clientID}) async {
    final response = await http.post(
      Uri.parse('$kBaseUrl/api/invite/refuse'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'coachID': coachID, 'clientID': clientID}),
    );
    if (response.statusCode != 200) {
      throw Exception('Échec du refus (${response.statusCode})');
    }
  }
}