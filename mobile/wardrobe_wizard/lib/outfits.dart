import 'package:flutter/material.dart';

class Outfits extends StatefulWidget {
  final String title;

  const Outfits({super.key, required this.title});

  @override
  State<Outfits> createState() => _OutfitsState();
}

class _OutfitsState extends State<Outfits> {
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
          children: [
            Text("Coming soon"),
          ],
        ),
      ),
    );
  }
}
