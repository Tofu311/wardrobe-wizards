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
<<<<<<< Updated upstream
            ),
          ],
=======
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
                  obscureText: true,
                  enableSuggestions: false,
                  autocorrect: false,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Password',
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 25),
                child: ElevatedButton(
                  onPressed: () {
                    Map<String, String> userInfo = {
                      'name':
                          '${userInfoControllers[0].text} ${userInfoControllers[1].text}',
                      'username': userInfoControllers[2].text,
                      'email': userInfoControllers[3].text,
                      'password': userInfoControllers[4].text,
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
                          SnackBar(
                            content: Text('Response: ${response.body}'),
                            backgroundColor: Colors.green,
                          ),
                        );
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
>>>>>>> Stashed changes
        ),
      ),
    );
  }
}
