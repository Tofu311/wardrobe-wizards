import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image/image.dart' as img;
import 'package:wardrobe_wizard/login.dart';

class Closet extends StatefulWidget {
  final String title;

  const Closet({super.key, required this.title});

  @override
  _ClosetState createState() => _ClosetState();
}

class _ClosetState extends State<Closet> {
  final ImagePicker _picker = ImagePicker();
  final List<XFile> images = [];

  Future<void> takePicture() async {
    final ImageSource? source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: const Icon(Icons.photo_camera),
                title: const Text('Take a picture'),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Select from photos'),
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
        // Compress the image
        File file = File(image.path);
        Uint8List imageBytes = await file.readAsBytes();
        img.Image? originalImage = img.decodeImage(imageBytes);
        img.Image resizedImage =
            img.copyResize(originalImage!, width: 800); // Resize to 800px width
        Uint8List compressedBytes = Uint8List.fromList(img
            .encodeJpg(resizedImage, quality: 85)); // Compress with 85% quality

        // Create a temporary file to store the compressed image
        File compressedFile = await File('${file.path}_compressed.jpg')
            .writeAsBytes(compressedBytes);

        Map<String, String> headersList = {
          "Authorization":
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MmQyNzkzZDBjMDg2Y2QyMjU3NGM1NSIsInVzZXJuYW1lIjoibWFya2I5IiwiaWF0IjoxNzMxNDQ1OTc3LCJleHAiOjE3MzE0NDk1Nzd9.P-RVTgTJrk-GeVgPrb4G8J6bnKjlwXGDO5mLjSETndg"
        };

        var request = http.MultipartRequest(
          'POST',
          Uri.parse("https://api.wardrobewizard.fashion/api/clothing"),
        );

        request.headers.addAll(headersList);
        request.files.add(
          await http.MultipartFile.fromPath(
            'image',
            compressedFile.path,
            contentType: MediaType('image', 'jpeg'),
          ),
        );

        var response = await request.send();
        if (response.statusCode == 200) {
          setState(() {
            images.add(image);
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Image uploaded successfully'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Upload failed: ${response.reasonPhrase}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
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
                  return Card(
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
