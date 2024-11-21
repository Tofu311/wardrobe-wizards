import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
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

  Future<void> takePicture() async {
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
        Response response = await post(
          Uri.parse('https://api.wardrobewizard.fashion/api/clothing'),
          headers: {"Authorization": "Bearer ${await getToken()}"},
          body: {
            'image': image.path,
          },
        );
        debugPrint(response.body);
        debugPrint(image.path);
        setState(
          () {
            images.add(image);
          },
        );
      }
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
        onPressed: takePicture,
        child: const Icon(Icons.add),
      ),
    );
  }
}
