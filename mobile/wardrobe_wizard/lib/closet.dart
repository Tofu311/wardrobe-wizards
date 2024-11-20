import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:wardrobe_wizard/clothing.dart';
import 'package:wardrobe_wizard/login.dart';

class Closet extends StatefulWidget {
  const Closet({super.key, required this.title});
  final String title;

  @override
  State<Closet> createState() => _ClosetState();
}

class _ClosetState extends State<Closet> {
  String dropdownValue = 'Sort By';
  List<Clothing> testCloset = [
    Clothing(
      name: 'T-shirt',
      size: 'XL',
      color: 'White',
      type: 'Top',
      style: 'Casual',
      image: const AssetImage('assets/tshirt.avif'),
    ),
    Clothing(
      name: 'Jeans',
      size: '32x34',
      color: 'Blue',
      type: 'Bottom',
      style: 'Casual',
      image: const AssetImage('assets/jeans.png'),
    ),
    Clothing(
      name: 'Sneakers',
      size: '12',
      color: 'Black',
      type: 'Shoes',
      style: 'Casual',
      image: const AssetImage('assets/vans.png'),
    ),
    Clothing(
      name: 'Hoodie',
      size: 'XL',
      color: 'Black',
      type: 'Jacket',
      style: 'Casual',
      image: const AssetImage('assets/hoodie.png'),
    ),
  ];
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
      //upload image to server

      if (image != null) {
        setState(() {
          images.add(image);
        });
      }
    }
  }

  //TODO: Implement sorting by type
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            color: Colors.red,
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (context) => const Login(title: 'Wardrobe Wizard'),
                ),
              );
            },
          ),
        ],
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
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
                value: dropdownValue,
                onChanged: (String? newValue) {
                  setState(() {
                    dropdownValue = newValue!;
                  });
                },
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
            //Sample data GridView
            /*
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                ),
                itemCount: testCloset.length,
                itemBuilder: (BuildContext context, int index) {
                  return GestureDetector(
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: Text(testCloset[index].name),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Image(
                                    image: testCloset[index].image,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Text('Size: ${testCloset[index].size}'),
                                Text('Color: ${testCloset[index].color}'),
                                Text('Style: ${testCloset[index].style}'),
                                Text('Type: ${testCloset[index].type}'),
                              ],
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: const Text('Close'),
                              ),
                            ],
                          );
                        },
                      );
                    },
                    child: Card(
                      child: Column(
                        children: [
                          Expanded(
                            child: Image(
                              image: testCloset[index].image,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(testCloset[index].name),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            */
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
