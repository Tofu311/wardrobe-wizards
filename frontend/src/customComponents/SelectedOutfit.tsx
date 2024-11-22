import React from "react";

const SelectedOutfit = ({ selectedItems, allItems }) => {
  const findDefaultOrSelectedItem = (type, items) => {
    const itemId = selectedItems[type];
    if (itemId) {
      return items.find((item) => item.id === itemId);
    }
    return items[0] || null;
  };

  const headwears = allItems.filter((item) => item.clothingType === "headwear");
  const outerwears = allItems.filter(
    (item) => item.clothingType === "outerwear"
  );
  const tops = allItems.filter((item) => item.clothingType === "top");
  const bottoms = allItems.filter((item) => item.clothingType === "bottom");
  const footwears = allItems.filter((item) => item.clothingType === "footwear");

  const selectedHeadwear = findDefaultOrSelectedItem("headwear", headwears);
  const selectedOuterwear = findDefaultOrSelectedItem("outerwear", outerwears);
  const selectedTop = findDefaultOrSelectedItem("top", tops);
  const selectedBottom = findDefaultOrSelectedItem("bottom", bottoms);
  const selectedFootwear = findDefaultOrSelectedItem("footwear", footwears);

  return (
    <div className="flex flex-col items-center justify-start h-screen pt-24 px-8 bg-[#FEFFF3]">
      {selectedHeadwear && (
        <div className="h-28 mb-2">
          <img
            src={selectedHeadwear.imagePath}
            alt="Headwear"
            className="h-full object-contain"
          />
        </div>
      )}

      <div className="flex justify-center gap-4 mb-2">
        {selectedOuterwear && (
          <div className="h-36">
            <img
              src={selectedOuterwear.imagePath}
              alt="Outerwear"
              className="h-full object-contain"
            />
          </div>
        )}
        {selectedTop && (
          <div className="h-36">
            <img
              src={selectedTop.imagePath}
              alt="Top"
              className="h-full object-contain"
            />
          </div>
        )}
      </div>

      {selectedBottom && (
        <div className="h-48 mb-2">
          <img
            src={selectedBottom.imagePath}
            alt="Bottom"
            className="h-full object-contain"
          />
        </div>
      )}

      {selectedFootwear && (
        <div className="flex gap-4 h-24">
          <img
            src={selectedFootwear.imagePath}
            alt="Footwear"
            className="h-full object-contain"
            style={{ transform: "scaleX(-1)" }}
          />
          <img
            src={selectedFootwear.imagePath}
            alt="Footwear"
            className="h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default SelectedOutfit;
