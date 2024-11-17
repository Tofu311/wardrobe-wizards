export interface ClothingItem {
    _id: string;
    imagePath: string;
    type: string;
    primaryColor: string;
    secondaryColor?: string;
    otherColors?: string[];
    material: string;
    temperature: string;
    description?: string;
  }
  