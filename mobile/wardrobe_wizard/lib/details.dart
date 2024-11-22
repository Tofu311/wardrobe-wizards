import 'package:flutter/material.dart';
import 'package:wardrobe_wizard/clothing.dart';

class Details extends StatefulWidget {
  final String title;
  final Clothing clothing;

  const Details({super.key, required this.title, required this.clothing});

  @override
  State<Details> createState() => _DetailsState();
}

class _DetailsState extends State<Details> {
  @override
  Widget build(BuildContext context) {
    Clothing clothing = widget.clothing;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(clothing.type),
            Text("Color: ${clothing.primaryColor}"),
            Text("Material: ${clothing.material}"),
            Image.network(clothing.imagePath),
            Text(clothing.description ?? ''),
          ],
        ),
      ),
    );
  }
}
