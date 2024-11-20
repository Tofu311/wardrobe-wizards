import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class Register extends StatefulWidget {
  const Register({super.key, required this.title});
  final String title;

  @override
  State<Register> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<Register> {
  bool passwordObscured = true;
  List<TextEditingController> userInfoControllers = [
    TextEditingController(),
    TextEditingController(),
    TextEditingController(),
    TextEditingController(),
    TextEditingController(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Padding(
                padding: EdgeInsets.fromLTRB(0, 50, 0, 50),
                child: Text(
                  'Ready to become a wardrobe wizard?\nSign up now!',
                  style: TextStyle(fontSize: 36),
                  textAlign: TextAlign.center,
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: TextField(
                  controller: userInfoControllers[0],
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'First Name',
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: TextField(
                  controller: userInfoControllers[1],
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Last Name',
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: TextField(
                  controller: userInfoControllers[2],
                  autocorrect: false,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Username',
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: TextField(
                  controller: userInfoControllers[3],
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Email',
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: TextField(
                  controller: userInfoControllers[4],
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
                    // Ensure all data is valid before making api call
                    for (var controller in userInfoControllers) {
                      if (controller.text.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Please fill out all fields'),
                            backgroundColor: Colors.red,
                          ),
                        );
                        return;
                      }
                    }
                    if (RegExp(r'^[^@]+@[^@]+\.[^@]+$')
                            .hasMatch(userInfoControllers[3].text) ==
                        false) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Please enter a valid email address'),
                          backgroundColor: Colors.red,
                        ),
                      );
                      return;
                    }
                    if (RegExp(r'^(?=.*[A-Z])(?=.*\d).{8,}$')
                            .hasMatch(userInfoControllers[4].text) ==
                        false) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                              'Password must be at least 8 characters long and '
                              'contain at least one uppercase letter and one digit.'),
                          backgroundColor: Colors.red,
                        ),
                      );
                      return;
                    }
                    Map<String, dynamic> userInfo = {
                      'name': {
                        'first': userInfoControllers[0].text,
                        'last': userInfoControllers[1].text,
                      },
                      'username': userInfoControllers[2].text,
                      'password': userInfoControllers[4].text,
                      'email': userInfoControllers[3].text,
                    };
                    debugPrint(userInfo.toString());
                    http
                        .post(
                      Uri.parse(
                          'https://api.wardrobewizard.fashion/api/users/register'),
                      headers: <String, String>{
                        "Content-Type": "application/json"
                      },
                      body: jsonEncode(userInfo),
                    )
                        .then(
                      (response) {
                        debugPrint(response.headers.toString());
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text("User created successfully!"),
                            backgroundColor: Colors.green,
                          ),
                        );
                        Navigator.pop(context);
                      },
                    );
                  },
                  child: const Padding(
                    padding: EdgeInsets.fromLTRB(50, 0, 50, 0),
                    child: Text('Sign Up'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
