class Clothing {
  final String imagePath;
  final String type;
  final String primaryColor;
  final String? secondaryColor;
  final List<String>? otherColors;
  final String material;
  final String temperature;
  final String? description;

  Clothing({
    required this.imagePath,
    required this.type,
    required this.primaryColor,
    this.secondaryColor,
    this.otherColors,
    required this.material,
    required this.temperature,
    this.description,
  });

  @override
  String toString() {
    return 'Clothing item:{imagePath: $imagePath, type: $type, primaryColor: $primaryColor'
        'secondaryColor: $secondaryColor, otherColors: $otherColors, material: '
        '$material, temperature: $temperature, description: $description}';
  }

  static Clothing fromJson(Map<String, dynamic> json) {
    return Clothing(
      imagePath: json['imagePath'],
      type: json['type'],
      primaryColor: json['primaryColor'],
      secondaryColor: json['secondaryColor'],
      otherColors: (json['otherColors'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      material: json['material'],
      temperature: json['temperature'],
      description: json['description'],
    );
  }
}
