import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image/image.dart' as img;
import 'package:image_picker/image_picker.dart';
import 'package:mime/mime.dart';
import 'package:wardrobe_wizard/login.dart';

class Closet extends StatefulWidget {
  const Closet({super.key, required this.title});
  final String title;

  @override
  State<Closet> createState() => _ClosetState();
}

class _ClosetState extends State<Closet> {
  final ImagePicker _picker = ImagePicker();
  final List<XFile> images = [];
  final FlutterSecureStorage storage = const FlutterSecureStorage();

  Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
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
        setState(
          () {
            images.add(image);
          },
        );
        File compressedImage = await compressImage(File(image.path));
        uploadImage(compressedImage);
      }
    }
  }

  Future<File> compressImage(File file) async {
    final rawImage = img.decodeImage(await file.readAsBytes());
    final resizedImage =
        img.copyResize(rawImage!, width: 1024); // Resize to 1024px width
    final compressedImage = File(file.path)
      ..writeAsBytesSync(img.encodeJpg(resizedImage, quality: 85));
    return compressedImage;
  }

  Future<void> uploadImage(File file) async {
    final uri = Uri.parse('https://api.wardrobewizard.fashion/api/clothing');
    final token = await getToken();

    try {
      // Create multipart request
      final request = MultipartRequest('POST', uri);

      // Add headers (e.g., authorization)
      request.headers['Authorization'] = 'Bearer $token';

      // Add file as a multipart field
      final mimeTypeData =
          lookupMimeType(file.path)!.split('/'); // e.g., ['image', 'jpeg']
      final multipartFile = await MultipartFile.fromPath(
        'image', // Field name (match your backend's expectations)
        file.path,
        contentType: MediaType(mimeTypeData[0], mimeTypeData[1]),
      );
      request.files.add(multipartFile);

      // Send the request
      final response = await request.send();

      if (response.statusCode == 201) {
        final responseBody = await Response.fromStream(response);
        debugPrint('Image uploaded successfully: ${responseBody.body}');
      } else {
        throw Exception(
            'Failed to upload image. Status: ${response.statusCode}');
      }
    } catch (error) {
      debugPrint('Error uploading image: $error');
    }
  }

  void deleteImage(int index) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: const Icon(Icons.delete),
                title: const Text('Remove Item'),
                onTap: () {
                  setState(() {
                    images.removeAt(index);
                  });
                  Navigator.of(context).pop();
                },
              ),
            ],
          ),
        );
      },
    );
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
                value: 'Sort By',
                onChanged: (String? newValue) {},
                items: <String>[
                  'Sort By',
                  'Tops',
                  'Bottoms',
                  'Jackets',
                  'Shoes'
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
                itemCount: images.length,
                itemBuilder: (BuildContext context, int index) {
                  return GestureDetector(
                    onLongPress: () => deleteImage(index),
                    child: Card(
                      child: Column(
                        children: [
                          Expanded(
                            child: Image.file(
                              File(images[index].path),
                              fit: BoxFit.cover,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text('Item ${index + 1}'),
                          ),
                        ],
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
