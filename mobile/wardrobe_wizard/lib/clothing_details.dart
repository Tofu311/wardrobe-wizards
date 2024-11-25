import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart';
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
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  Future<void> deleteItem() async {
    final String clothingId = widget.clothing.id;
    final String? token = await getToken();

    try {
      final response = await delete(
        Uri.parse(
            'https://api.wardrobewizard.fashion/api/clothing/$clothingId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        if (mounted) {
          Navigator.pop(context, true);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to delete item. ${response.statusCode}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error deleting item. $error'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    Clothing clothing = widget.clothing;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
        actions: [
          IconButton(
              icon: const Icon(Icons.delete),
              color: Colors.red,
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      title: const Text('Delete Item'),
                      content: const Text(
                          'Are you sure you want to delete this item?'),
                      actions: <Widget>[
                        TextButton(
                          onPressed: () {
                            Navigator.pop(context);
                          },
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () {
                            deleteItem();
                            Navigator.pop(context);
                          },
                          child: const Text(
                            'Delete',
                            style: TextStyle(color: Colors.red),
                          ),
                        ),
                      ],
                    );
                  },
                );
              }),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              clothing.type,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            Text("Color: ${clothing.primaryColor}"),
            Text("Material: ${clothing.material}"),
            SizedBox(
              width: 350,
              height: 350,
              child: Image.network(clothing.imagePath),
            ),
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Text(
                clothing.description ?? '',
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
