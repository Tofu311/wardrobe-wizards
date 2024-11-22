// WheelCarousel.tsx
import CarouselComponent from "./CarouselComponent";

// Define item structure
interface Item {
  id: string;
  imagePath: string;
}

// Define props structure
interface WheelCarouselProps {
  headwear: Item[];
  top: Item[];
  outerwear: Item[];
  bottom: Item[];
  footwear: Item[];
  selectedItems?: {
    headwear?: string;
    top?: string;
    outerwear?: string;
    bottom?: string;
    footwear?: string;
  };
}

export default function WheelCarousel({
  headwear,
  top,
  outerwear,
  bottom,
  footwear,
  selectedItems = {}, // Default to an empty object if not provided
}: WheelCarouselProps) {
  // Default selected items structure
  const defaultSelectedItems = {
    headwear: undefined,
    top: undefined,
    outerwear: undefined,
    bottom: undefined,
    footwear: undefined,
  };

  // Merge defaultSelectedItems with the provided selectedItems
  const selected = { ...defaultSelectedItems, ...selectedItems };

  return (
    <div>
      <CarouselComponent items={headwear} selectedItemId={selected.headwear} />
      <CarouselComponent items={top} selectedItemId={selected.top} />
      <CarouselComponent
        items={outerwear}
        selectedItemId={selected.outerwear}
      />
      <CarouselComponent items={bottom} selectedItemId={selected.bottom} />
      <CarouselComponent items={footwear} selectedItemId={selected.footwear} />
    </div>
  );
}
