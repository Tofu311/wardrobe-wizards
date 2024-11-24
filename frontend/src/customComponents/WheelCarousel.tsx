import CarouselComponent from "./CarouselComponent";

interface Item {
  id: string;
  imagePath: string;
}

interface WheelCarouselProps {
  headwear: Item[];
  top: Item[];
  outerwear: Item[];
  bottom: Item[];
  footwear: Item[];
  selectedItems: Record<string, string | undefined>;
  setSelectedItems: React.Dispatch<
    React.SetStateAction<Record<string, string | undefined>>
  >;
  clothingTypeEnabled: Record<string, boolean>;
  setClothingTypeEnabled: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export default function WheelCarousel({
  headwear,
  top,
  outerwear,
  bottom,
  footwear,
  selectedItems,
  setSelectedItems,
  clothingTypeEnabled,
  setClothingTypeEnabled,
}: WheelCarouselProps) {
  const handleSelectHeadwear = (selectedItemId: string) => {
    setSelectedItems((prev) => ({ ...prev, headwear: selectedItemId }));
  };

  const handleSelectTop = (selectedItemId: string) => {
    setSelectedItems((prev) => ({ ...prev, top: selectedItemId }));
  };

  const handleSelectOuterwear = (selectedItemId: string) => {
    setSelectedItems((prev) => ({ ...prev, outerwear: selectedItemId }));
  };

  const handleSelectBottom = (selectedItemId: string) => {
    setSelectedItems((prev) => ({ ...prev, bottom: selectedItemId }));
  };

  const handleSelectFootwear = (selectedItemId: string) => {
    setSelectedItems((prev) => ({ ...prev, footwear: selectedItemId }));
  };

  const renderCarousel = (
    type: string,
    items: Item[],
    selectedItemId: string | undefined,
    onSelectItem: (id: string) => void
  ) => {
    return (
      <div>
        <label className="flex items-center mb-2 text-white font-bold">
          <input
            type="checkbox"
            checked={clothingTypeEnabled[type]} // Ensure clothingTypeEnabled is accessible
            onChange={(e) =>
              setClothingTypeEnabled((prev) => ({
                ...prev,
                [type]: e.target.checked,
              }))
            }
            className="mr-2"
          />
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </label>
        {clothingTypeEnabled[type] ? (
          <CarouselComponent
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
          />
        ) : (
          <div className="mb-4 h-28 rounded-xl bg-white font-bold flex items-center justify-center">
            {type.charAt(0).toUpperCase() + type.slice(1)} is not selected
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {renderCarousel(
        "headwear",
        headwear,
        selectedItems.headwear,
        handleSelectHeadwear
      )}
      {renderCarousel("top", top, selectedItems.top, handleSelectTop)}
      {renderCarousel(
        "outerwear",
        outerwear,
        selectedItems.outerwear,
        handleSelectOuterwear
      )}
      {renderCarousel(
        "bottom",
        bottom,
        selectedItems.bottom,
        handleSelectBottom
      )}
      {renderCarousel(
        "footwear",
        footwear,
        selectedItems.footwear,
        handleSelectFootwear
      )}
    </div>
  );
}
