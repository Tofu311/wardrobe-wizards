import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:wardrobe_wizard/closet.dart';
import 'package:wardrobe_wizard/login_and_signup/pwdreset.dart';
import 'package:wardrobe_wizard/login_and_signup/register.dart';

class Login extends StatefulWidget {
  const Login({super.key, required this.title});
  final String title;

  @override
  State<Login> createState() => _LoginPageState();
}

class _LoginPageState extends State<Login> {
  TextEditingController usernameController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  bool passwordObscured = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Padding(
              padding: EdgeInsets.only(bottom: 50),
              child: Text(
                'Welcome to\nWardrobe Wizard!',
                style: TextStyle(fontSize: 36),
                textAlign: TextAlign.center,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextField(
                controller: usernameController,
                autocorrect: false,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Username',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextField(
                controller: passwordController,
                obscureText: passwordObscured,
                enableSuggestions: false,
                autocorrect: false,
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  labelText: 'Password',
                  suffixIcon: IconButton(
                    icon: Icon(
                      passwordObscured
                          ? Icons.visibility
                          : Icons.visibility_off,
                    ),
                    onPressed: () {
                      setState(() {
                        passwordObscured = !passwordObscured;
                      });
                    },
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 25),
              child: ElevatedButton(
                onPressed: () {
                  debugPrint(
                    jsonEncode(
                      <String, String>{
                        "username": usernameController.text,
                        "password": passwordController.text,
                      },
                    ),
                  );
                  http
                      .post(
                    Uri.parse(
                        'https://api.wardrobewizard.fashion/api/users/login'),
                    headers: <String, String>{
                      "Content-Type": "application/json"
                    },
                    body: jsonEncode(
                      <String, String>{
                        "username": usernameController.text,
                        "password": passwordController.text,
                      },
                    ),
                  )
                      .then(
                    (response) {
                      debugPrint(response.headers.toString());
                      debugPrint(response.body);
                      debugPrint(response.statusCode.toString());
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Response: ${response.body}'),
                          backgroundColor: Colors.green,
                        ),
                      );
                      // Do not go to closet if login unsuccessful
                      if (response.statusCode != 200) {
                        return;
                      }
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) {
                            return const Closet(title: 'My Closet');
                          },
                        ),
                      );
                    },
                  );
                },
                child: const Padding(
                  padding: EdgeInsets.fromLTRB(50, 0, 50, 0),
                  child: Text('Sign In'),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) {
                        return const PwdReset(title: 'Wardrobe Wizard');
                      },
                    ),
                  );
                },
                child: const Padding(
                  padding: EdgeInsets.fromLTRB(30, 0, 30, 0),
                  child: Text('Forgot Password'),
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) {
                      return const Register(title: 'Wardrobe Wizard');
                    },
                  ),
                );
              },
              child: const Text(
                "Don't have an account? Sign Up",
              ),
            ),
          ],
        ),
      ),
    );
  }
}
