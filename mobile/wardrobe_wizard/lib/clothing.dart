import 'package:flutter/material.dart';

class Clothing {
  final String name;
  final String size;
  final String color;
  final String type;
  final String style;
  final AssetImage image;

  Clothing({
    required this.name,
    required this.size,
    required this.color,
    required this.type,
    required this.style,
    required this.image,
  });

  @override
  String toString() {
    return 'Clothing{name: $name, size: $size, color: $color,'
        'type: $type, style $style, image: ${image.assetName}';
  }
}
