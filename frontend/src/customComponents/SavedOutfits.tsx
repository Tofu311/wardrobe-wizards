import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const SavedOutfits = () => {
  const [outfits, setOutfits] = useState([]);
  const [allClothing, setAllClothing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_ROOT = "https://api.wardrobewizard.fashion/api";

  useEffect(() => {
    const fetchOutfitsAndClothing = async () => {
      try {
        // Fetch outfits and all clothing items in parallel
        const [outfitsResponse, clothingResponse] = await Promise.all([
          fetch(`${API_ROOT}/clothing/outfit`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch(`${API_ROOT}/clothing`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        if (!outfitsResponse.ok || !clothingResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const outfitsData = await outfitsResponse.json();
        const clothingData = await clothingResponse.json();

        setOutfits(outfitsData);
        setAllClothing(clothingData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutfitsAndClothing();
  }, []);

  const getClothingItemById = (itemId) => {
    return allClothing.find((item) => item._id === itemId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-300">Loading outfits...</div>
      </div>
    );
  }

  if (!outfits.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-300">No saved outfits found.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {outfits.map((outfit, index) => (
        <Card
          key={outfit._id}
          className="bg-[#FFF3BB] bg-opacity-80 border-none backdrop-blur-sm"
        >
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              Outfit {index + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {outfit.items.map((itemId) => {
                const item = getClothingItemById(itemId);
                return item ? (
                  <div
                    key={itemId}
                    className="aspect-square bg-gray-800 rounded-lg p-2 relative overflow-hidden"
                  >
                    <img
                      src={item.imagePath}
                      alt={`${item.type} clothing item`}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-3 font-bold text-center">
                      {item.type}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedOutfits;
