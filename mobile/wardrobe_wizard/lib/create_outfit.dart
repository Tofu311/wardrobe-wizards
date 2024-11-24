import 'dart:convert';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart';
import 'package:wardrobe_wizard/clothing.dart';

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
  Map<String, Clothing?> selectedItems = {
    'HEADWEAR': null,
    'OUTERWEAR': null,
    'TOP': null,
    'BOTTOM': null,
    'FOOTWEAR': null,
  };
  Map<String, PageController> pageControllers = {
    'HEADWEAR': PageController(),
    'OUTERWEAR': PageController(),
    'TOP': PageController(),
    'BOTTOM': PageController(),
    'FOOTWEAR': PageController(),
  };
  bool isLoading = false;

  Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  Future<void> fetchCloset() async {
    setState(() => isLoading = true);
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
          groupItems();
          isLoading = false;
        });
      } else {
        setState(() => isLoading = false);
        throw Exception(
            'Failed to fetch closet items. Status: ${response.statusCode}');
      }
    } catch (error) {
      setState(() => isLoading = false);
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

  void groupItems() {
    groupedItems = {};
    for (var item in closetItems) {
      if (!groupedItems.containsKey(item.type)) {
        groupedItems[item.type] = [];
      }
      groupedItems[item.type]!.add(item);
    }
  }

  void checkboxChanged(bool? value, String type, Clothing item) {
    setState(() {
      if (value == true) {
        selectedItems[type] = item;
      } else {
        selectedItems[type] = null;
      }
      debugPrint('Selected $type: ${selectedItems[type]?.id}');
    });
  }

  Future<void> submitOutfit() async {
    final selectedIds = selectedItems.values
        .where((item) => item != null)
        .map((item) => item!.id)
        .toList();
    if (selectedIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Outfit is empty, select at least one item.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    debugPrint(selectedIds.toString());
    try {
      final String? token = await getToken();
      final response = await post(
        Uri.parse('https://api.wardrobewizard.fashion/api/clothing/saveOutfit'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'items': selectedIds}),
      );

      if (response.statusCode == 201) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Success! Your outfit has been saved.'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content:
                  Text("Uh oh! Something went wrong. ${response.statusCode}"),
              backgroundColor: Colors.red,
            ),
          );
        }
        debugPrint('Save error: ${response.body}');
      }
    } catch (error) {
      debugPrint('Error saving outfit: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('An error occurred while saving the outfit.'),
            backgroundColor: Colors.red,
          ),
        );
      }
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
            onPressed: submitOutfit,
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
        child: isLoading
            ? const CircularProgressIndicator()
            : ListView(
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
                                    checkboxChanged(selectedItems[type] != item,
                                        type, item);
                                  },
                                  child: Card(
                                    child: Column(
                                      children: [
                                        Expanded(
                                          child: Image.network(
                                            item.imagePath,
                                            fit: BoxFit.contain,
                                          ),
                                        ),
                                        Checkbox(
                                          value: selectedItems[type] == item,
                                          onChanged: (value) {
                                            checkboxChanged(value, type, item);
                                          },
                                        ),
                                      ],
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
