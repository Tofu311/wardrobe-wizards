import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'clothing.dart';
import 'create_outfit.dart';
import 'login.dart';

class Outfits extends StatefulWidget {
  const Outfits({super.key, required this.title});
  final String title;

  @override
  State<Outfits> createState() => _OutfitsState();
}

class _OutfitsState extends State<Outfits> {
  final FlutterSecureStorage storage = const FlutterSecureStorage();
  final List<Clothing> headwears = [];
  final List<Clothing> outerwears = [];
  final List<Clothing> tops = [];
  final List<Clothing> bottoms = [];
  final List<Clothing> footwears = [];
  bool isLoading = false;

  Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  @override
  void initState() {
    super.initState();
    fetchClothingItems();
  }

  Future<void> fetchClothingItems() async {
    setState(() => isLoading = true);
    try {
      final String? token = await getToken();
      final responses = await Future.wait([
        fetchClothingType('HEADWEAR', token),
        fetchClothingType('OUTERWEAR', token),
        fetchClothingType('TOP', token),
        fetchClothingType('BOTTOM', token),
        fetchClothingType('FOOTWEAR', token),
      ]);

      setState(() {
        headwears.clear();
        outerwears.clear();
        tops.clear();
        bottoms.clear();
        footwears.clear();

        headwears.addAll(responses[0]);
        outerwears.addAll(responses[1]);
        tops.addAll(responses[2]);
        bottoms.addAll(responses[3]);
        footwears.addAll(responses[4]);

        isLoading = false;
      });
    } catch (error) {
      debugPrint('Error fetching clothing items: $error');
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<List<Clothing>> fetchClothingType(String type, String? token) async {
    final response = await get(
      Uri.parse(
          'https://api.wardrobewizard.fashion/api/clothing?clothingType=$type'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body);
      return data.map((item) => Clothing.fromJson(item)).toList();
    } else {
      throw Exception(
          'Failed to fetch $type items. Status: ${response.statusCode}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            color: Colors.red,
            onPressed: () {
              Navigator.pushReplacement(context,
                  MaterialPageRoute(builder: (context) {
                return const Login(title: 'Wardrobe Wizard');
              }));
            },
          ),
        ],
      ),
      body: Center(
        child: isLoading
            ? const CircularProgressIndicator()
            : GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                ),
                itemCount: headwears.length +
                    outerwears.length +
                    tops.length +
                    bottoms.length +
                    footwears.length,
                itemBuilder: (BuildContext context, int index) {
                  final item = getItemByIndex(index);
                  return GestureDetector(
                    onTap: () {
                      // Handle item selection
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
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text('Item ${item.type}'),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) {
                return const CreateOutfit(title: 'New Outfit');
              },
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Clothing getItemByIndex(int index) {
    if (index < headwears.length) {
      return headwears[index];
    } else if (index < headwears.length + outerwears.length) {
      return outerwears[index - headwears.length];
    } else if (index < headwears.length + outerwears.length + tops.length) {
      return tops[index - headwears.length - outerwears.length];
    } else if (index <
        headwears.length + outerwears.length + tops.length + bottoms.length) {
      return bottoms[
          index - headwears.length - outerwears.length - tops.length];
    } else {
      return footwears[index -
          headwears.length -
          outerwears.length -
          tops.length -
          bottoms.length];
    }
  }
}
