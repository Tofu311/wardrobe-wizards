// WheelCarousel.jsx
import * as React from "react";
import CarouselComponent from "./CarouselComponent";

export default function WheelCarousel({
  headwear,
  top,
  outerwear,
  bottom,
  footwear,
  selectedItems,
}) {
  // Ensure selectedItems is an object with clothing types as keys
  const defaultSelectedItems = {
    headwear: null,
    top: null,
    outerwear: null,
    bottom: null,
    footwear: null,
  };

  // Merge defaultSelectedItems with the provided selectedItems
  const selected = { ...defaultSelectedItems, ...selectedItems };

  return (
    <div>
      <CarouselComponent
        items={headwear}
        selectedItemId={selected.headwear}
        title="Headwear"
      />
      <CarouselComponent
        items={top}
        selectedItemId={selected.top}
        title="Top"
      />
      <CarouselComponent
        items={outerwear}
        selectedItemId={selected.outerwear}
        title="Outerwear"
      />
      <CarouselComponent
        items={bottom}
        selectedItemId={selected.bottom}
        title="Bottom"
      />
      <CarouselComponent
        items={footwear}
        selectedItemId={selected.footwear}
        title="Footwear"
      />
    </div>
  );
}
