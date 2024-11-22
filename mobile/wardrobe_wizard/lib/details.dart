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
      debugPrint('ID: $clothingId');
      if (response.statusCode == 200) {
        debugPrint('Item deleted successfully');
        if (mounted) {
          Navigator.pop(context, true);
        }
      } else {
        debugPrint('Failed to delete item. Status: ${response.statusCode}');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to delete item. Please try again.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (error) {
      debugPrint('Error deleting item: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error deleting item. Please try again.'),
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
            ElevatedButton(
              onPressed: deleteItem,
              style: ButtonStyle(
                backgroundColor: WidgetStateProperty.all(Colors.red),
                foregroundColor: WidgetStateProperty.all(Colors.white),
              ),
              child: const Text("Delete"),
            )
          ],
        ),
      ),
    );
  }
}
