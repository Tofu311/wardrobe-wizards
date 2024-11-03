import 'package:flutter/material.dart';

class PwdReset extends StatefulWidget {
  const PwdReset({super.key, required this.title});
  final String title;

  @override
  State<PwdReset> createState() => _PwdResetState();
}

class _PwdResetState extends State<PwdReset> {
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
              padding: EdgeInsets.fromLTRB(8, 0, 8, 50),
              child: Text(
                "Enter your account's email to send a password reset link",
                style: TextStyle(fontSize: 36),
                textAlign: TextAlign.center,
              ),
            ),
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: TextField(
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Email',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 25),
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('API call not yet implemented'),
                      backgroundColor: Colors.red,
                    ),
                  );
                },
                child: const Padding(
                  padding: EdgeInsets.fromLTRB(50, 0, 50, 0),
                  child: Text('Submit'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
