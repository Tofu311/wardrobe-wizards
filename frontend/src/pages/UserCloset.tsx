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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  const [clothes, setClothes] = useState<ClothingItem[]>(mockClothes);
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
      const data = await response.json();
      setClothes(Array.isArray(data) ? data : []);
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
    <div className="flex h-screen bg-[#183642]">
      
      {/* Navbar */}
      <div id="navbar" className="mb-2 h-full">
        <nav className="w-full bg-[#313D5A] p-2 flex justify-between items-center fixed top-0 left-0 z-10">
          <h1 className="text-[#CBC5EA] text-2xl font-bold ml-4">Wardrobe Wizard</h1>
          <div className="flex space-x-4">
            <Button>
              Generate Outfit
            </Button>
            <Button>
              My Account
            </Button>
            <Button>
              Logout
            </Button>
          </div>
        </nav>
      </div>

    {/* Body */}
        {/* Sidebar */}
        <div className="w-64 p-4 flex flex-col bg-[#183642] border-r-2 border-[#313D5A] mt-12">
          <Tabs defaultValue="closet" className="mb-4">
            <TabsList 
              className="bg-[#313D5A] flex flex-col w-full h-full 
              items-start justify-start"
            >
              <TabsTrigger
                value="closet"
                className="text-2xl w-full items-start 
                          hover:bg-primary/80 hover:text-[#CBC5EA]"
                onClick={() => switchTab("closet")}
              >
                My Closet
              </TabsTrigger>
              <TabsTrigger
                value="outfit"
                className="text-2xl w-full items-start 
                          hover:bg-primary/50 hover:text-[#CBC5EA]"
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
            } h-3/4 bg-[#313D5A] p-4 rounded-lg mb-4`}
          >
            <h2 className="text-xl text-[#CBC5EA] font-bold mb-4 text-center">
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
            
            {/* Scrollable Filters */}
            <div className="overflow-y-auto h-3/4"> 
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="types">
                      <AccordionTrigger 
                        className="text-black bg-[#CBC5EA] rounded h-full mb-2
                                  px-2 hover:bg-primary/80 hover:text-[#CBC5EA]"
                      > 
                        Types
                      </AccordionTrigger>
                  <AccordionContent className="w-3/4">
                    <Button
                    variant={
                      filter.includes("HEADWEAR") ? "default_closet" : "outline_closet"
                    }
                    className="mb-2 w-full justify-start"
                    onClick={() =>
                      setFilter((prev) =>
                        prev.includes("HEADWEAR")
                          ? prev.filter((f: string) => f !== "HEADWEAR") // Remove if already selected
                          : [...prev.filter((f: string) => f !== "all"), "HEADWEAR"] // Add to the array
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
                            ? prev.filter((f: string) => f !== "TOP") // Remove if already selected
                            : [...prev.filter((f: string) => f !== "all"), "TOP"] // Add to the array
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
                            ? prev.filter((f: string) => f !== "OUTERWEAR") // Remove if already selected
                            : [...prev.filter((f: string) => f !== "all"), "OUTERWEAR"] // Add to the array
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
                            ? prev.filter((f: string) => f !== "BOTTOM") // Remove if already selected
                            : [...prev.filter((f: string) => f !== "all"), "BOTTOM"] // Add to the array
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
                            ? prev.filter((f: string) => f !== "FOOTWEAR") // Remove if already selected
                            : [...prev.filter((f: string) => f !== "all"), "FOOTWEAR"] // Add to the array
                        )
                      }
                    >
                      Footwear
                    </Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="colors">
                  <AccordionTrigger 
                    className="text-black bg-[#CBC5EA] rounded h-full 
                              mb-2 px-2 hover:bg-primary/80 hover:text-[#CBC5EA]"
                  >
                    Colors
                  </AccordionTrigger>
                  <AccordionContent className="w-3/4">
                  <Button
                    variant={
                      filter.includes("RED") ? "default_closet" : "outline_closet"
                    }
                    className="mb-2 w-full justify-start text-[#183642]"
                    onClick={() =>
                      setFilter((prev) =>
                        prev.includes("RED")
                          ? prev.filter((f: string) => f !== "RED") // Remove if already selected
                          : [...prev.filter((f: string) => f !== "all"), "RED"] // Add to the array
                      )
                    }
                    >
                      Red
                    </Button>
                    <Button
                      variant={
                        filter.includes("BLUE") ? "default_closet" : "outline_closet"
                      }
                      className="mb-2 w-full justify-start"
                      onClick={() =>
                        setFilter((prev) =>
                          prev.includes("BLUE")
                            ? prev.filter((f: string) => f !== "BLUE") // Remove if already selected
                            : [...prev.filter((f: string) => f !== "all"), "BLUE"] // Add to the array
                        )
                      }
                    >
                      Blue
                    </Button>
                    <Button
                      variant={
                        filter.includes("GREEN") ? "default_closet" : "outline_closet"
                      }
                      className="mb-2 w-full justify-start"
                      onClick={() =>
                        setFilter((prev) =>
                          prev.includes("GREEN")
                            ? prev.filter((f: string) => f !== "GREEN") // Remove if already selected
                            : [...prev.filter((f: string) => f !== "all"), "GREEN"] // Add to the array
                        )
                      }
                    >
                      Green
                    </Button>
                    <Button
                      variant={
                        filter.includes("YELLOW") ? "default_closet" : "outline_closet"
                      }
                      className="mb-2 w-full justify-start"
                      onClick={() =>
                        setFilter((prev) =>
                          prev.includes("YELLOW")
                            ? prev.filter((f: string) => f !== "YELLOW") // Remove if already selected
                            : [...prev.filter((f: string) => f !== "all"), "YELLOW"] // Add to the array
                        )
                      }
                    >
                      Yellow
                    </Button>
                    <Button
                      variant={
                        filter.includes("PURPLE") ? "default_closet" : "outline_closet"
                      }
                      className="mb-2 w-full justify-start"
                      onClick={() =>
                        setFilter((prev) =>
                          prev.includes("PURPLE")
                            ? prev.filter((f: string) => f !== "PURPLE") // Remove if already selected
                            : [...prev.filter((f: string) => f !== "all"), "PURPLE"] // Add to the array
                        )
                      }
                    >
                      Purple
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="mt-auto">
            <Sheet>
              <SheetTrigger asChild>
                  <Button className="w-full border-2 border-[#313D5A] bg-[#183642] hover:bg-[#313D5A]">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Clothing
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#183642]">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-[#CBC5EA] mb-4">Add New Clothing</SheetTitle>
                  <SheetDescription className="text-white">
                    Upload an image of your clothing item
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4 bg-[#313D5A] rounded p-2">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture" className="text-white">Picture</Label>
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
      <div id="main-content" className="flex-1 p-8 mt-4">
        <div className="bg-[#313D5A] h-full w-full rounded-lg">

          {activeTab === "closet" && (
            <>
                <h1 className="text-3xl font-bold mb-6 text-[#CBC5EA] mt-4 p-4 border-b-2 border-[#183642]">My Closet</h1>
              {isLoading ? (
                <p className="p-4 text-white">Loading...</p>
              ) : error ? (
                <p className="p-4 text-yellow-500">{error}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-auto">
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
            <>
              <h1 className="text-3xl font-bold mb-6 text-[#CBC5EA] mt-4 p-4 border-b-2 border-[#183642]">My Outfits</h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-auto">
                  
              </div>
            </>
          )}
        </div>
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
