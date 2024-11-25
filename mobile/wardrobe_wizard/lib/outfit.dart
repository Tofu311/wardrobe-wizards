class Outfit {
  final String id;
  final String userId;
  final List<String> itemIds;

  Outfit({
    required this.id,
    required this.userId,
    required this.itemIds,
  });

  static Outfit fromJson(Map<String, dynamic> json) {
    return Outfit(
      id: json['_id'] ?? '',
      userId: json['userId'] ?? '',
      itemIds: List<String>.from(json['items'] ?? []),
    );
  }

  @override
  String toString() {
    return 'Outfit{id: $id, userId: $userId, itemIds: $itemIds}';
  }
}
