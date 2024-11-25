import 'package:flutter/material.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
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
