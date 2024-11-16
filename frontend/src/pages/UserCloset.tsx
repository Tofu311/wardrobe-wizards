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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

// const API_ROOT = "http://localhost:3000/api"; // local
const API_ROOT = "https://api.wardrobewizard.fashion/api"; // prod

// DEVELOPMENT ONLY
const mockClothes = [
  { id: 1, type: "TOP", imagePath: "/placeholder.svg?height=100&width=100" },
  { id: 2, type: "BOTTOM", imagePath: "/placeholder.svg?height=100&width=100" },
  {
    id: 3,
    type: "FOOTWEAR",
    imagePath: "/placeholder.svg?height=100&width=100",
  },
  { id: 4, type: "TOP", imagePath: "/placeholder.svg?height=100&width=100" },
  { id: 5, type: "BOTTOM", imagePath: "/placeholder.svg?height=100&width=100" },
  {
    id: 6,
    type: "FOOTWEAR",
    imagePath: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 7,
    type: "HEADWEAR",
    imagePath: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 8,
    type: "OUTERWEAR",
    imagePath: "/placeholder.svg?height=100&width=100",
  },
  // Add more mock items as needed
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

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  const filteredClothes = filter.includes("all")
    ? clothes
    : clothes.filter((item) => filter.includes(item.type));

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
    fetch(`${API_ROOT}/clothing`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setClothes(data);
      })
      .catch((error) => {
        console.error("Error fetching clothing:", error);
      });
  }, []);

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredClothes.map(
                (item: { id: number; type: string; image: string }) => (
                  <div
                    key={item.id}
                    className="bg-muted rounded-lg p-2 flex items-center justify-center"
                  >
                    <img
                      src={item.imagePath}
                      alt={`Clothing item ${item.id}`}
                      className="max-w-full h-auto"
                    />
                  </div>
                )
              )}
            </div>
          </>
        )}
        {activeTab === "outfit" && (
          <h1 className="text-3xl font-bold mb-6 text-white">Saved Outfits</h1>
        )}
      </div>
    </div>
  );
}
