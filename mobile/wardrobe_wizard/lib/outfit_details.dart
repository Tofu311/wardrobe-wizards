import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart';
import 'package:wardrobe_wizard/clothing.dart';
import 'package:wardrobe_wizard/outfit.dart';

class OutfitDetails extends StatefulWidget {
  final String title;
  final Outfit outfit;
  final List<Clothing> clothingItems;
  const OutfitDetails(
      {super.key,
      required this.title,
      required this.outfit,
      required this.clothingItems});

  @override
  State<OutfitDetails> createState() => _OutfitDetailsState();
}

class _OutfitDetailsState extends State<OutfitDetails> {
  @override
  Widget build(BuildContext context) {
    const clothingOrder = [
      'HEADWEAR',
      'TOP',
      'OUTERWEAR',
      'BOTTOM',
      'FOOTWEAR'
    ];

    List<Clothing> filterClothingByType(String type) {
      return widget.clothingItems.where((clothing) {
        return clothing.type == type &&
            widget.outfit.itemIds.contains(clothing.id);
      }).toList();
    }

    Future<String?> getToken() async {
      return await const FlutterSecureStorage().read(key: 'auth_token');
    }

    Future<void> deleteOutfit() async {
      final String? token = await getToken();
      final response = await delete(
        Uri.parse(
            'https://api.wardrobewizard.fashion/api/clothing/outfit/${widget.outfit.id}'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200 && context.mounted) {
        Navigator.pop(context, true);
      } else {
        throw Exception('Failed to delete outfit');
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.delete),
            color: Colors.red,
            onPressed: () {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: const Text('Delete Outfit'),
                    content: const Text(
                        'Are you sure you want to delete this outfit?'),
                    actions: <Widget>[
                      TextButton(
                        onPressed: () async {
                          try {
                            await deleteOutfit();
                          } catch (error) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Error: $error'),
                                ),
                              );
                            }
                          }
                        },
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          deleteOutfit();
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
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            children: <Widget>[
              for (String type in clothingOrder)
                for (Clothing clothing in filterClothingByType(type))
                  SizedBox(
                    width: 200,
                    height: 200,
                    child: Image.network(
                      clothing.imagePath,
                    ),
                  ),
            ],
          ),
        ),
      ),
    );
  }
}
