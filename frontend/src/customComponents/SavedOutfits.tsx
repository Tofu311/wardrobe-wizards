import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ClothingItem {
  _id: string;
  imagePath: string;
  type: string;
}

interface Outfit {
  _id: string;
  items: string[];
}

const SavedOutfits = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [allClothing, setAllClothing] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  const API_ROOT = "https://api.wardrobewizard.fashion/api";

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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      const response = await fetch(`${API_ROOT}/clothing/outfit/${outfitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Remove the deleted outfit from the state
        setOutfits((prevOutfits) =>
          prevOutfits.filter((outfit) => outfit._id !== outfitId)
        );
        setShowDeleteDialog(false);
        setSelectedOutfit(null);
      } else {
        throw new Error("Failed to delete oufit");
      }
    } catch (error) {
      console.error("Error deleting outfit:", error);
    }
  };

  useEffect(() => {
    fetchOutfitsAndClothing();
  }, []);

  const getClothingItemById = (itemId: string): ClothingItem | undefined => {
    return allClothing.find((item) => item._id === itemId);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

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
      {outfits.map((outfit: Outfit, index: number) => (
        <Card
          key={outfit._id}
          className="bg-[#FFF3BB] bg-opacity-80 border-none backdrop-blur-sm relative"
        >
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              Outfit {index + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {outfit.items.map((itemId: string) => {
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
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 hover:bg-red-100"
            onClick={() => {
              setSelectedOutfit(outfit);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </Card>
      ))}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Outfit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this outfit? This action cannot be
              undone. Your clothes will still remain in your closet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedOutfit(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedOutfit && handleDeleteOutfit(selectedOutfit._id)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SavedOutfits;
