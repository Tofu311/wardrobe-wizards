import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { ClothingItem } from "../../../api/src/types/index";

// const API_ROOT = "http://localhost:3000/api"; // local
const API_ROOT = "https://api.wardrobewizard.fashion/api"; // prod

// DEVELOPMENT ONLY
const mockClothes: ClothingItem[] = [
  {
    _id: "648b8bba3e2e456d6f5a8c2e",
    type: "TOP",
    imagePath: "/placeholder.svg",
    primaryColor: "Blue",
    material: "Cotton",
    temperature: "Warm",
  },
  {
    _id: "648b8bba3e2e456d6f5a8c3f",
    type: "BOTTOM",
    imagePath: "/placeholder2.svg",
    primaryColor: "Black",
    material: "Denim",
    temperature: "Cold",
  },
];

/*
const mockOutfits = [
  { id: 1, image: "/placeholder.svg?height=100&width=100" },
  { id: 2, image: "/placeholder.svg?height=100&width=100" },
  { id: 3, image: "/placeholder.svg?height=100&width=100" },
  { id: 4, image: "/placeholder.svg?height=100&width=100" },
  { id: 5, image: "/placeholder.svg?height=100&width=100" },
  { id: 6, image: "/placeholder.svg?height=100&width=100" },
  // Add more mock items as needed
];*/

export default function UserCloset() {
  const [filter, setFilter] = useState<string[]>(["all"]);
  const [clothes, setClothes] = useState(mockClothes);
  const [activeTab, setActiveTab] = useState("closet");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  const fetchClothing = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = filter.includes("all") ? "" : `?type=${filter[0]}`;
      const response = await fetch(`${API_ROOT}/clothing${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setClothes(await response.json());
    } catch (error) {
      console.error("Error fetching clothing:", error);
      setError("Failed to fetch clothing items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /*
  const filteredClothes = filter.includes("all")
    ? clothes
    : clothes.filter((item) => filter.includes(item.type));
  */

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_ROOT}/clothing`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.status === 201) {
        const newItem = await response.json();
        setClothes((prevClothes) => [...prevClothes, newItem]);
        setSelectedFile(null);
      } else {
        throw new Error("Failed to add clothing item");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchClothing();
  }, [filter]);

  return (
    <div className="flex h-screen bg-[#313D5A]">
      {/* Sidebar */}
      <div className="w-64 p-4 flex flex-col bg-[#CBC5EA]">
        <Tabs defaultValue="closet">
          <TabsList className="bg-[#CBC5EA] flex flex-col items-start mb-4 w-full h-full justify-start">
            <TabsTrigger
              value="closet"
              className="text-2xl w-full items-start"
              onClick={() => switchTab("closet")}
            >
              My Closet
            </TabsTrigger>
            <TabsTrigger
              value="outfit"
              className="text-2xl w-full items-start"
              onClick={() => switchTab("outfit")}
            >
              My Outfits
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter (box) */}
        <div
          className={`${
            activeTab === "outfit" ? "pointer-events-none opacity-50" : ""
          } h-3/4 border-[#73628A] border-4 p-4 rounded-lg`}
        >
          <h2 className="text-xl text-[#183642] font-bold mb-4 text-center">
            Filters
          </h2>
          <Button
            variant={
              filter.includes("all") ? "default_closet" : "outline_closet"
            }
            className="mb-2 w-full justify-start"
            onClick={() => setFilter(["all"])}
          >
            All
          </Button>
          <Button
            variant={
              filter.includes("HEADWEAR") ? "default_closet" : "outline_closet"
            }
            className="mb-2 w-full justify-start"
            onClick={() =>
              setFilter((prev) =>
                prev.includes("HEADWEAR")
                  ? prev.filter((f: string) => f !== "HEADWEAR")
                  : ["HEADWEAR"]
              )
            }
          >
            Headwear
          </Button>
          <Button
            variant={
              filter.includes("TOP") ? "default_closet" : "outline_closet"
            }
            className="mb-2 w-full justify-start"
            onClick={() =>
              setFilter((prev) =>
                prev.includes("TOP")
                  ? prev.filter((f: string) => f !== "TOP")
                  : ["TOP"]
              )
            }
          >
            Tops
          </Button>
          <Button
            variant={
              filter.includes("OUTERWEAR") ? "default_closet" : "outline_closet"
            }
            className="mb-2 w-full justify-start"
            onClick={() =>
              setFilter((prev) =>
                prev.includes("OUTERWEAR")
                  ? prev.filter((f: string) => f !== "OUTERWEAR")
                  : ["OUTERWEAR"]
              )
            }
          >
            Outerwear
          </Button>
          <Button
            variant={
              filter.includes("BOTTOM") ? "default_closet" : "outline_closet"
            }
            className="mb-2 w-full justify-start"
            onClick={() =>
              setFilter((prev) =>
                prev.includes("BOTTOM")
                  ? prev.filter((f: string) => f !== "BOTTOM")
                  : ["BOTTOM"]
              )
            }
          >
            Bottoms
          </Button>
          <Button
            variant={
              filter.includes("FOOTWEAR") ? "default_closet" : "outline_closet"
            }
            className="mb-2 w-full justify-start"
            onClick={() =>
              setFilter((prev) =>
                prev.includes("FOOTWEAR")
                  ? prev.filter((f: string) => f !== "FOOTWEAR")
                  : ["FOOTWEAR"]
              )
            }
          >
            Footwear
          </Button>
        </div>
        <div className="mt-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4 bg-[#183642]" /> Add
                Clothing
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#CBC5EA]">
              <SheetHeader>
                <SheetTitle>Add New Clothing</SheetTitle>
                <SheetDescription>
                  Upload an image of your clothing item
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="picture">Picture</Label>
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    disabled={isUploading}
                  />
                </div>
                <Button
                  onClick={() =>
                    selectedFile && handleImageUpload(selectedFile)
                  }
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
                {isUploading && <p>Uploading...</p>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div id="main-content" className="flex-1 p-8 overflow-auto">
        {activeTab === "closet" && (
          <>
            <h1 className="text-3xl font-bold mb-6 text-white">My Closet</h1>
            {isLoading ? (
              <p className="text-white">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {clothes.map((item) => (
                  <div
                    key={item._id}
                    className="aspect-square bg-white rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="w-full h-full relative">
                      <img
                        src={item.imagePath}
                        alt={`${item.type} clothing item`}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === "outfit" && (
          <h1 className="text-3xl font-bold mb-6 text-white">Saved Outfits</h1>
        )}
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.type}</DialogTitle>
            <DialogDescription>
              Color: {selectedItem?.primaryColor || "N/A"}
              <br />
              Material: {selectedItem?.material || "N/A"}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full aspect-square relative bg-white rounded-lg p-4">
            <img
              src={selectedItem?.imagePath}
              alt={`${selectedItem?.type} clothing item`}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          {selectedItem?.description && (
            <p className="text-sm text-gray-500">{selectedItem.description}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
