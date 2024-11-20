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
  outerwear: Item[];
  top: Item[];
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
  outerwear,
  top,
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
      {headwear.length > 0 && (
        <CarouselComponent
          items={headwear}
          selectedItemId={selected.headwear}
        />
      )}
      {outerwear.length > 0 && (
        <CarouselComponent
          items={outerwear}
          selectedItemId={selected.outerwear}
        />
      )}
      {top.length > 0 && (
        <CarouselComponent items={top} selectedItemId={selected.top} />
      )}
      {bottom.length > 0 && (
        <CarouselComponent items={bottom} selectedItemId={selected.bottom} />
      )}
      {footwear.length > 0 && (
        <CarouselComponent
          items={footwear}
          selectedItemId={selected.footwear}
        />
      )}
    </div>
  );
}
