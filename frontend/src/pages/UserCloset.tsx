import { useState } from "react";
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
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";



import { PlusCircle } from "lucide-react";

// DEVELOPMENT ONLY
const mockClothes = [
  { id: 1, type: "top", image: "/placeholder.svg?height=100&width=100" },
  { id: 2, type: "bottom", image: "/placeholder.svg?height=100&width=100" },
  { id: 3, type: "footwear", image: "/placeholder.svg?height=100&width=100" },
  { id: 4, type: "top", image: "/placeholder.svg?height=100&width=100" },
  { id: 5, type: "bottom", image: "/placeholder.svg?height=100&width=100" },
  { id: 6, type: "footwear", image: "/placeholder.svg?height=100&width=100" },
  // Add more mock items as needed
];

const mockOutfits = [
  { id: 1, image: "/placeholder.svg?height=100&width=100" },
  { id: 2, image: "/placeholder.svg?height=100&width=100" },
  { id: 3, image: "/placeholder.svg?height=100&width=100" },
  { id: 4, image: "/placeholder.svg?height=100&width=100" },
  { id: 5, image: "/placeholder.svg?height=100&width=100" },
  { id: 6, image: "/placeholder.svg?height=100&width=100" },
  // Add more mock items as needed
];

export default function UserCloset() {
  const [filter, setFilter] = useState<string[]>(["all"]);
  const [clothes, setClothes] = useState(mockClothes);
  const [activeTab, setActiveTab] = useState("closet");

  const switchTab = (tab: string) => {
    setActiveTab(tab);
  };

  const filteredClothes =
    filter.includes("all") ? clothes : clothes.filter((item) => filter.includes(item.type));

  const addClothing = (type: string) => {
    const newItem = {
      id: clothes.length + 1,
      type: type,
      image: "/placeholder.svg?height=100&width=100",
    };
    setClothes([...clothes, newItem]);
  };

  return (
    <div className="flex h-screen bg-[#313D5A]">
      {/* Sidebar */}
      <div className="w-64 p-4 flex flex-col bg-[#CBC5EA]">
        <Tabs defaultValue="closet">
          <TabsList className="bg-[#CBC5EA] flex flex-col items-start mb-4 w-full h-full justify-start">
            <TabsTrigger value="closet" className="text-2xl w-full items-start" onClick={() => switchTab("closet")}>My Closet</TabsTrigger>
            <TabsTrigger value="outfit" className="text-2xl w-full items-start" onClick={() => switchTab("outfit")}>My Outfits</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter (box) */}
        <div className={`${activeTab === "outfit" ? "pointer-events-none opacity-50" : ""} h-3/4 border-[#73628A] border-4 p-4 rounded-lg`}>
            <h2 className="text-xl text-[#183642] font-bold mb-4 text-center">Filters</h2>
          <Button
            variant={filter.includes("all") ? "default_closet" : "outline_closet"}
            className="mb-2 w-full justify-start"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
            <Button
            variant={filter.includes("top") ? "default_closet" : "outline_closet"}
            className="mb-2 w-full justify-start"
            onClick={() =>
              setFilter((prev) =>
                prev.includes("top")
                  ? prev.filter((f: string) => f !== "top")
                  : [...prev, "top"]
              )
            }
            >
            Tops
            </Button>
            <Button
            variant={filter.includes("bottom") ? "default_closet" : "outline_closet"}
            className="mb-2 w-full justify-start"
            onClick={() =>
              setFilter((prev) =>
                prev.includes("bottom")
                  ? prev.filter((f: string) => f !== "bottom")
                  : [...prev, "bottom"]
              )
            }
            >
            Bottoms
            </Button>
            <Button
            variant={filter.includes("footwear") ? "default_closet" : "outline_closet"}
            className="mb-2 w-full justify-start"
            onClick={() =>
              setFilter((prev) =>
                prev.includes("footwear")
                  ? prev.filter((f: string) => f !== "footwear")
                  : [...prev, "footwear"]
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
                <PlusCircle className="mr-2 h-4 w-4 bg-[#183642]" /> Add Clothing
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#CBC5EA]">
              <SheetHeader>
                <SheetTitle>Add New Clothing</SheetTitle>
                <SheetDescription>
                  Choose the type of clothing you want to add to your closet.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Button variant="default_closet" onClick={() => addClothing("top")}>Add Top</Button>
                <Button variant="default_closet" onClick={() => addClothing("bottom")}>
                  Add Bottom
                </Button>
                <Button variant="default_closet" onClick={() => addClothing("footwear")}>
                  Add Footwear
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div id='main-content' className="flex-1 p-8 overflow-auto">
        {activeTab === "closet" && (
          <>
            <h1 className="text-3xl font-bold mb-6 text-white">My Closet</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredClothes.map((item: { id: number; type: string; image: string }) => (
                <div
                  key={item.id}
                  className="bg-muted rounded-lg p-2 flex items-center justify-center"
                >
                  <img
                    src={item.image}
                    alt={`Clothing item ${item.id}`}
                    className="max-w-full h-auto"
                  />
                </div>
              ))}
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
