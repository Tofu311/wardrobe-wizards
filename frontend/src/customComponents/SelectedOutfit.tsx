import { Button } from "@/components/ui/button";
import React from "react";

const SelectedOutfit = ({ selectedItems, allItems, clothingTypeEnabled }) => {
  const findDefaultOrSelectedItem = (type, items) => {
    if (!clothingTypeEnabled[type]) {
      return null;
    }
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

  const handleSaveOutfit = async () => {
    const selectedIds = [
      clothingTypeEnabled.headwear ? selectedHeadwear?.id : null,
      clothingTypeEnabled.outerwear ? selectedOuterwear?.id : null,
      clothingTypeEnabled.top ? selectedTop?.id : null,
      clothingTypeEnabled.bottom ? selectedBottom?.id : null,
      clothingTypeEnabled.footwear ? selectedFootwear?.id : null,
    ].filter(Boolean); // Remove any null/undefined values

    try {
      const response = await fetch(
        "https://api.wardrobewizard.fashion/api/clothing/saveOutfit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ items: selectedIds }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert("Outfit saved successfully!");
        console.log("Save result:", result);
      } else {
        alert("Failed to save outfit. Please try again.");
        console.error("Save error:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving outfit:", error);
      alert("An error occurred while saving the outfit.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen pt-12 px-8 bg-[#FEFFF3]">
      <div className="flex justify-end w-full mb-4 mt-4">
        <Button variant="outline" onClick={handleSaveOutfit}>
          Save Outfit
        </Button>
      </div>
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
