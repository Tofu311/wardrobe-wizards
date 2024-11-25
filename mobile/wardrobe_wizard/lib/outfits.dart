import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:wardrobe_wizard/outfit.dart';
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
  final List<Clothing> headwear = [];
  final List<Clothing> outerwear = [];
  final List<Clothing> tops = [];
  final List<Clothing> bottoms = [];
  final List<Clothing> footwear = [];
  final List<Outfit> outfits = [];
  final List<Clothing> clothingItems = [];
  final List<List<Clothing>> outfitsClothing = [];
  String? error;
  bool isLoading = false;

  Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  @override
  void initState() {
    super.initState();
    fetchOutfitsAndClothing();
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
        headwear.clear();
        outerwear.clear();
        tops.clear();
        bottoms.clear();
        footwear.clear();

        headwear.addAll(responses[0]);
        outerwear.addAll(responses[1]);
        tops.addAll(responses[2]);
        bottoms.addAll(responses[3]);
        footwear.addAll(responses[4]);

        isLoading = false;
      });
    } catch (error) {
      debugPrint('Error fetching clothing items: $error');
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> fetchOutfitsAndClothing() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      final String? token = await getToken();
      if (token == null) {
        throw Exception('Token is null');
      }
      final responses = await Future.wait([
        get(
          Uri.parse('https://api.wardrobewizard.fashion/api/clothing/outfit'),
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
        get(
          Uri.parse('https://api.wardrobewizard.fashion/api/clothing'),
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      ]);

      final outfitsResponse = responses[0];
      final clothingResponse = responses[1];

      if (outfitsResponse.statusCode == 200 &&
          clothingResponse.statusCode == 200) {
        final outfitsData = jsonDecode(outfitsResponse.body) as List<dynamic>;
        final clothingData = jsonDecode(clothingResponse.body) as List<dynamic>;

        final List<Outfit> fetchedOutfits =
            outfitsData.map((item) => Outfit.fromJson(item)).toList();
        final List<Clothing> allClothing =
            clothingData.map((item) => Clothing.fromJson(item)).toList();

        final List<List<Clothing>> fetchedOutfitsClothing = await Future.wait(
          fetchedOutfits
              .map((outfit) => fetchClothingForOutfit(outfit, allClothing))
              .toList(),
        );

        setState(() {
          outfits.clear();
          outfitsClothing.clear();
          outfits.addAll(fetchedOutfits);
          outfitsClothing.addAll(fetchedOutfitsClothing);
          isLoading = false;
        });
        debugPrint('Outfits: ${outfits.toString()}');
      } else {
        debugPrint(
            'Failed to fetch data. Status: ${outfitsResponse.statusCode}');
        throw Exception('Failed to fetch data');
      }
    } catch (err) {
      setState(() {
        isLoading = false;
        error = err.toString();
      });
      debugPrint('Failed to fetch data. Status: $error');
    }
  }

  Future<List<Clothing>> fetchClothingForOutfit(
      Outfit outfit, List<Clothing> allClothing) async {
    return allClothing
        .where((clothing) => outfit.itemIds.contains(clothing.id))
        .toList();
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
            : error != null
                ? Text('Error: $error')
                : GridView.builder(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                    ),
                    itemCount: outfits.length,
                    itemBuilder: (BuildContext context, int index) {
                      final outfitClothing = outfitsClothing[index];
                      return Card(
                        child: Column(
                          children: [
                            Expanded(
                              child: GridView.builder(
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                        crossAxisCount: 2),
                                itemCount: outfitClothing.length,
                                itemBuilder:
                                    (BuildContext context, int clothingIndex) {
                                  final clothing =
                                      outfitClothing[clothingIndex];
                                  return Image.network(
                                    clothing.imagePath,
                                    fit: BoxFit.contain,
                                  );
                                },
                              ),
                            ),
                          ],
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
    if (index < headwear.length) {
      return headwear[index];
    } else if (index < headwear.length + outerwear.length) {
      return outerwear[index - headwear.length];
    } else if (index < headwear.length + outerwear.length + tops.length) {
      return tops[index - headwear.length - outerwear.length];
    } else if (index <
        headwear.length + outerwear.length + tops.length + bottoms.length) {
      return bottoms[index - headwear.length - outerwear.length - tops.length];
    } else {
      return footwear[index -
          headwear.length -
          outerwear.length -
          tops.length -
          bottoms.length];
    }
  }
}
