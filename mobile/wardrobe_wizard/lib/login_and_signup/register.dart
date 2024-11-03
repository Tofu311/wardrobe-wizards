import 'package:flutter/material.dart';

class Register extends StatefulWidget {
  const Register({super.key, required this.title});
  final String title;

  @override
  State<Register> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<Register> {
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
                'Ready to become a wardrobe wizard?\nSign up now!',
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
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: TextField(
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Password',
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
                  child: Text('Sign Up'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
