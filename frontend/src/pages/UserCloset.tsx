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

export default function UserCloset() {
  const [filter, setFilter] = useState("all");
  const [clothes, setClothes] = useState(mockClothes);

  const filteredClothes =
    filter === "all" ? clothes : clothes.filter((item) => item.type === filter);

  const addClothing = (type: string) => {
    const newItem = {
      id: clothes.length + 1,
      type: type,
      image: "/placeholder.svg?height=100&width=100",
    };
    setClothes([...clothes, newItem]);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-muted p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          className="mb-2 w-full justify-start"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "top" ? "default" : "outline"}
          className="mb-2 w-full justify-start"
          onClick={() => setFilter("top")}
        >
          Tops
        </Button>
        <Button
          variant={filter === "bottom" ? "default" : "outline"}
          className="mb-2 w-full justify-start"
          onClick={() => setFilter("bottom")}
        >
          Bottoms
        </Button>
        <Button
          variant={filter === "footwear" ? "default" : "outline"}
          className="mb-2 w-full justify-start"
          onClick={() => setFilter("footwear")}
        >
          Footwear
        </Button>
        <div className="mt-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Clothing
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Clothing</SheetTitle>
                <SheetDescription>
                  Choose the type of clothing you want to add to your closet.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Button onClick={() => addClothing("top")}>Add Top</Button>
                <Button onClick={() => addClothing("bottom")}>
                  Add Bottom
                </Button>
                <Button onClick={() => addClothing("footwear")}>
                  Add Footwear
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">My Closet</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredClothes.map((item) => (
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
      </div>
    </div>
  );
}
