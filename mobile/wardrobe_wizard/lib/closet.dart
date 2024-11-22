import 'dart:convert';
import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image/image.dart' as img;
import 'package:image_picker/image_picker.dart';
import 'package:mime/mime.dart';
import 'package:wardrobe_wizard/clothing.dart';
import 'package:wardrobe_wizard/details.dart';
import 'package:wardrobe_wizard/login.dart';

class Closet extends StatefulWidget {
  const Closet({super.key, required this.title});
  final String title;

  @override
  State<Closet> createState() => _ClosetState();
}

class _ClosetState extends State<Closet> {
  final ImagePicker _picker = ImagePicker();
  final List<Clothing> closetItems = [];
  final FlutterSecureStorage storage = const FlutterSecureStorage();
  String selectedType = 'Sort By Type';

  Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  @override
  void initState() {
    super.initState();
    fetchCloset();
  }

  Future<void> getImage() async {
    final ImageSource? source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: const Icon(Icons.photo_camera),
                title: const Text('Take a Photo'),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choose from Gallery'),
                onTap: () => Navigator.pop(context, ImageSource.gallery),
              ),
            ],
          ),
        );
      },
    );

    if (source != null) {
      final XFile? image = await _picker.pickImage(source: source);
      if (image != null) {
        uploadImage(File(image.path));
      }
    }
  }

  Future<void> uploadImage(File image) async {
    const snackBar = SnackBar(
      content: Text('Uploading image...'),
      duration: Duration(days: 1), // Keep the SnackBar visible until dismissed
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
    final Uri uri =
        Uri.parse('https://api.wardrobewizard.fashion/api/clothing');
    final String? token = await getToken();
    try {
      final MultipartRequest request = MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer $token';
      final List<String> mimeTypeData = lookupMimeType(image.path)!.split('/');
      final MultipartFile multipartFile = await MultipartFile.fromPath(
        'image',
        image.path,
        contentType: MediaType(mimeTypeData[0], mimeTypeData[1]),
      );
      request.files.add(multipartFile);

      final StreamedResponse response = await request.send();

      if (response.statusCode == 201) {
        final responseBody = await Response.fromStream(response);
        setState(() {
          final Map<String, dynamic> json = jsonDecode(responseBody.body);
          Clothing newItem = Clothing.fromJson(json);
          closetItems.add(newItem);
          debugPrint('New item: $newItem');
        });
        debugPrint('Image uploaded successfully: ${responseBody.body}');
      } else {
        throw Exception(
            'Failed to upload image. Status: ${response.statusCode}');
      }
    } catch (error) {
      debugPrint('Error uploading image: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error uploading image: $error'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
      }
    }
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
        });
        debugPrint('Closet items: $closetItems');
      } else {
        throw Exception(
            'Failed to fetch closet items. Status: ${response.statusCode}');
      }
    } catch (error) {
      debugPrint('Error fetching closet items: $error');
    }
  }

  List<Clothing> getFilteredItems() {
    if (selectedType == 'Sort By Type') {
      return closetItems;
    } else {
      return closetItems
          .where((item) => item.type == selectedType.toUpperCase())
          .toList();
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
        child: Column(
          children: <Widget>[
            const Padding(
              padding: EdgeInsets.fromLTRB(0, 20, 0, 0),
              child: Text("Welcome to your closet!",
                  style: TextStyle(fontSize: 24)),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: DropdownButton<String>(
                value: selectedType,
                onChanged: (String? newValue) {
                  setState(() {
                    selectedType = newValue!;
                  });
                },
                items: <String>[
                  'Sort By Type',
                  'Headwear',
                  'Top',
                  'Outerwear',
                  'Bottom',
                  'Footwear'
                ].map<DropdownMenuItem<String>>((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
              ),
            ),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                ),
                itemCount: getFilteredItems().length,
                itemBuilder: (BuildContext context, int index) {
                  final item = getFilteredItems()[index];
                  return GestureDetector(
                    onTap: () async {
                      final result = await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => Details(
                            title: 'Details',
                            clothing: item,
                          ),
                        ),
                      );
                      if (result == true) {
                        fetchCloset();
                      }
                    },
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Image.network(
                          item.imagePath,
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: getImage,
        child: const Icon(Icons.add),
      ),
    );
  }
}
