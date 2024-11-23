import 'dart:convert';

import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart';
import 'package:wardrobe_wizard/clothing.dart';
import 'package:wardrobe_wizard/details.dart';

class CreateOutfit extends StatefulWidget {
  final String title;

  const CreateOutfit({super.key, required this.title});

  @override
  State<CreateOutfit> createState() => _CreateOutfitState();
}

class _CreateOutfitState extends State<CreateOutfit> {
  final FlutterSecureStorage storage = const FlutterSecureStorage();
  final List<Clothing> closetItems = [];
  Map<String, List<Clothing>> groupedItems = {};

  Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  Future<void> fetchCloset() async {
    try {
      final response = await get(
        Uri.parse('https://api.wardrobewizard.fashion/api/clothing'),
        headers: <String, String>{
          'Authorization': 'Bearer ${await getToken()}'
        },
      );
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        setState(() {
          closetItems.clear();
          for (var item in data) {
            closetItems.add(Clothing.fromJson(item));
          }
          groupItemsByType();
        });
      } else {
        throw Exception(
            'Failed to fetch closet items. Status: ${response.statusCode}');
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error fetching closet items: $error'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void groupItemsByType() {
    groupedItems = {};
    for (var item in closetItems) {
      if (!groupedItems.containsKey(item.type)) {
        groupedItems[item.type] = [];
      }
      groupedItems[item.type]!.add(item);
    }
  }

  @override
  void initState() {
    super.initState();
    fetchCloset();
  }

  @override
  Widget build(BuildContext context) {
    final List<String> clothingOrder = [
      'HEADWEAR',
      'TOP',
      'OUTERWEAR',
      'BOTTOM',
      'FOOTWEAR'
    ];
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.inverseSurface,
            ),
            child: const Text(
              'Submit',
              style: TextStyle(fontSize: 16),
            ),
          )
        ],
      ),
      body: Center(
        child: ListView(
          children: clothingOrder.map((type) {
            if (!groupedItems.containsKey(type)) {
              return Container();
            }
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: CarouselSlider(
                    options: CarouselOptions(
                      height: 200.0,
                      enlargeCenterPage: true,
                      enableInfiniteScroll: false,
                      viewportFraction: 0.5,
                    ),
                    items: groupedItems[type]!.map((item) {
                      return Builder(
                        builder: (BuildContext context) {
                          return GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) {
                                    return Details(
                                      title: 'Details',
                                      clothing: item,
                                    );
                                  },
                                ),
                              );
                            },
                            child: Card(
                              child: Expanded(
                                child: Image.network(
                                  item.imagePath,
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                          );
                        },
                      );
                    }).toList(),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}
