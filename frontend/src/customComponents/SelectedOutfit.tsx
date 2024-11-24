import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface ClothingItem {
  id: string;
  clothingType: string;
  imagePath: string;
}

interface SelectedOutfitProps {
  selectedItems: Record<string, string | undefined>;
  allItems: ClothingItem[];
  clothingTypeEnabled: Record<string, boolean>;
}

const SelectedOutfit: React.FC<SelectedOutfitProps> = ({
  selectedItems,
  allItems,
  clothingTypeEnabled,
}) => {
  const { toast } = useToast();

  const findDefaultOrSelectedItem = (
    type: string,
    items: ClothingItem[]
  ): ClothingItem | null => {
    if (!clothingTypeEnabled[type]) {
      return null;
    }
    const itemId = selectedItems[type];
    if (itemId) {
      return items.find((item) => item.id === itemId) || null;
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
      selectedHeadwear?.id,
      selectedOuterwear?.id,
      selectedTop?.id,
      selectedBottom?.id,
      selectedFootwear?.id,
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
        toast({
          title: "Success!",
          description: "Your outfit has been saved.",
          duration: 3000,
        });
        console.log("Save result:", result);
      } else {
        toast({
          title: "Uh oh! Something went wrong",
          description: "We weren't able to save your outfit.",
          variant: "destructive",
          duration: 3000,
        });
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 48.507 48.507 1 0 1 11.186 0Z"
            />
          </svg>
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
      <Toaster />
    </div>
  );
};

export default SelectedOutfit;
