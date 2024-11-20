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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlusCircle } from "lucide-react";
import { ClothingItem } from "@/types/types";
import { useNavigate } from "react-router-dom";

// const API_ROOT = "http://localhost:3000/api"; // local
const API_ROOT = "https://api.wardrobewizard.fashion/api"; // prod

const CLOTHING_TYPES = ["HEADWEAR", "TOP", "OUTERWEAR", "BOTTOM", "FOOTWEAR"];

// DEVELOPMENT ONLY
/*
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
*/

export default function UserCloset() {
  const [filter, setFilter] = useState<string[]>(["all"]);
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [activeTab, setActiveTab] = useState("closet");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  const fetchClothing = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = "";
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

  const filteredClothes = filter.includes("all")
    ? clothes
    : clothes.filter((item) => {
        return filter.some((f) => {
          if (["RED", "BLUE", "GREEN", "YELLOW", "PURPLE"].includes(f)) {
            return item.primaryColor.toUpperCase() === f; // Check for color
          }
          if (
            ["HEADWEAR", "TOP", "OUTERWEAR", "BOTTOM", "FOOTWEAR"].includes(f)
          ) {
            return item.type === f; // Check for type
          }
          return false; // Default case
        });
      });

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

  const handleReclassify = async (clothingId: string, newType: string) => {
    try {
      const response = await fetch(
        `${API_ROOT}/clothing/${clothingId}/reclassify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ type: newType }),
        }
      );

      if (response.status === 200) {
        //const updatedClothing = await response.json();
        setClothes((prevClothes) =>
          prevClothes.map((item) =>
            item._id === clothingId ? { ...item, type: newType } : item
          )
        );
        setSelectedItem(null);
      } else {
        throw new Error("Failed to reclassify clothing item");
      }
    } catch (error) {
      console.error("Error reclassifying clothing:", error);
    }
  };

  useEffect(() => {
    fetchClothing();
  }, [filter]);

  return (
    <div className="flex flex-col min-h-screen bg-[#183642]">
      {/* Navbar */}
      <nav className="w-full bg-[#313D5A] p-2 flex justify-between items-center fixed top-0 left-0 z-50">
        <h1 className="text-[#CBC5EA] text-2xl font-bold ml-4">
          Wardrobe Wizard
        </h1>
        <div className="flex space-x-4">
          <Button
            onClick={() => {
              navigate("/outfits");
            }}
          >
            Generate Outfit
          </Button>
          <Button
            onClick={() => {
              navigate("/account");
            }}
          >
            My Account
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            Logout
          </Button>
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="fixed w-64 h-[calc(100vh-4rem)] overflow-y-auto bg-[#183642] border-r-2 border-[#313D5A]">
            <div className="p-4 flex flex-col h-full">
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
                } flex-1 bg-[#313D5A] p-4 rounded-lg mb-4 overflow-y-auto`}
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
                <div className="overflow-y-auto">
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
                            filter.includes("HEADWEAR")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("HEADWEAR")
                                ? prev.filter((f) => f !== "HEADWEAR")
                                : [
                                    ...prev.filter((f) => f !== "all"),
                                    "HEADWEAR",
                                  ]
                            )
                          }
                        >
                          Headwear
                        </Button>
                        <Button
                          variant={
                            filter.includes("TOP")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("TOP")
                                ? prev.filter((f) => f !== "TOP")
                                : [...prev.filter((f) => f !== "all"), "TOP"]
                            )
                          }
                        >
                          Tops
                        </Button>
                        <Button
                          variant={
                            filter.includes("OUTERWEAR")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("OUTERWEAR")
                                ? prev.filter((f) => f !== "OUTERWEAR")
                                : [
                                    ...prev.filter((f) => f !== "all"),
                                    "OUTERWEAR",
                                  ]
                            )
                          }
                        >
                          Outerwear
                        </Button>
                        <Button
                          variant={
                            filter.includes("BOTTOM")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("BOTTOM")
                                ? prev.filter((f) => f !== "BOTTOM")
                                : [...prev.filter((f) => f !== "all"), "BOTTOM"]
                            )
                          }
                        >
                          Bottoms
                        </Button>
                        <Button
                          variant={
                            filter.includes("FOOTWEAR")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("FOOTWEAR")
                                ? prev.filter((f) => f !== "FOOTWEAR")
                                : [
                                    ...prev.filter((f) => f !== "all"),
                                    "FOOTWEAR",
                                  ]
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
                            filter.includes("RED")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start text-[#183642]"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("RED")
                                ? prev.filter((f) => f !== "RED")
                                : [...prev.filter((f) => f !== "all"), "RED"]
                            )
                          }
                        >
                          Red
                        </Button>
                        <Button
                          variant={
                            filter.includes("BLUE")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("BLUE")
                                ? prev.filter((f) => f !== "BLUE")
                                : [...prev.filter((f) => f !== "all"), "BLUE"]
                            )
                          }
                        >
                          Blue
                        </Button>
                        <Button
                          variant={
                            filter.includes("GREEN")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("GREEN")
                                ? prev.filter((f) => f !== "GREEN")
                                : [...prev.filter((f) => f !== "all"), "GREEN"]
                            )
                          }
                        >
                          Green
                        </Button>
                        <Button
                          variant={
                            filter.includes("YELLOW")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("YELLOW")
                                ? prev.filter((f) => f !== "YELLOW")
                                : [...prev.filter((f) => f !== "all"), "YELLOW"]
                            )
                          }
                        >
                          Yellow
                        </Button>
                        <Button
                          variant={
                            filter.includes("PURPLE")
                              ? "default_closet"
                              : "outline_closet"
                          }
                          className="mb-2 w-full justify-start"
                          onClick={() =>
                            setFilter((prev) =>
                              prev.includes("PURPLE")
                                ? prev.filter((f) => f !== "PURPLE")
                                : [...prev.filter((f) => f !== "all"), "PURPLE"]
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
                      <SheetTitle className="text-[#CBC5EA] mb-4">
                        Add New Clothing
                      </SheetTitle>
                      <SheetDescription className="text-white">
                        Upload an image of your clothing item
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4 bg-[#313D5A] rounded p-2">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture" className="text-white">
                          Picture
                        </Label>
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="bg-[#313D5A] min-h-full rounded-lg">
            {activeTab === "closet" && (
              <>
                <h1 className="text-3xl font-bold mb-6 text-[#CBC5EA] mt-4 p-4 border-b-2 border-[#183642] sticky top-0 bg-[#313D5A] z-10">
                  My Closet
                </h1>
                {isLoading ? (
                  <p className="p-4 text-white">Loading...</p>
                ) : error ? (
                  <p className="p-4 text-yellow-500">{error}</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                    {filteredClothes.map((item) => (
                      <div
                        key={item._id}
                        className="aspect-square bg-[#FFF3BB] bg-opacity-80 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors"
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
                <h1 className="text-3xl font-bold mb-6 text-[#CBC5EA] mt-4 p-4 border-b-2 border-[#183642] sticky top-0 bg-[#313D5A] z-10">
                  My Outfits
                </h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                  {/* Outfit content here */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.type}</DialogTitle>
            <DialogDescription>
              Color:
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center">
                  {selectedItem?.primaryColor || "N/A"}
                  <svg
                    className="ml-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select a Color</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Red</DropdownMenuItem>
                  <DropdownMenuItem>Blue</DropdownMenuItem>
                  <DropdownMenuItem>Green</DropdownMenuItem>
                  <DropdownMenuItem>Yellow</DropdownMenuItem>
                  <DropdownMenuItem>Purple</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <br />
              Material:
              <DropdownMenu>
                <DropdownMenuTrigger>
                  {selectedItem?.material || "N/A"}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select a Material</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Cotton</DropdownMenuItem>
                  <DropdownMenuItem>Polyester</DropdownMenuItem>
                  <DropdownMenuItem>Wool</DropdownMenuItem>
                  <DropdownMenuItem>Silk</DropdownMenuItem>
                  <DropdownMenuItem>Leather</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <Select
            defaultValue={selectedItem?.type}
            onValueChange={(value) =>
              selectedItem && handleReclassify(selectedItem._id, value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select clothing type" />
            </SelectTrigger>
            <SelectContent>
              {CLOTHING_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>
    </div>
  );
}
