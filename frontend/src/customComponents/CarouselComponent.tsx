import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface CarouselComponentProps {
  items: { id: string; imagePath: string }[];
  selectedItemId?: string;
  title?: string;
}

export default function CarouselComponent({
  items,
  selectedItemId,
}: CarouselComponentProps) {
  const apiRef = React.useRef<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const displayedItems = React.useMemo(() => {
    const minLength = 10;
    if (items.length === 0) {
      return [];
    } else {
      const timesToRepeat = Math.ceil(minLength / items.length);
      return Array(timesToRepeat).fill(items).flat().slice(0, minLength);
    }
  }, [items]);

  React.useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    const onSelect = () => {
      const newIndex = api.selectedScrollSnap();
      setSelectedIndex(newIndex);
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, []);

  React.useEffect(() => {
    const api = apiRef.current;
    if (!api || !selectedItemId) return;

    const index = displayedItems.findIndex(
      (item) => item.id === selectedItemId
    );

    if (index !== -1) {
      api.scrollTo(index, false);
      setSelectedIndex(index);
    }
  }, [selectedItemId, displayedItems]);

  return (
    <div className="mb-2">
      {displayedItems.length > 0 ? (
        <Carousel
          setApi={(api) => {
            apiRef.current = api;
          }}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {displayedItems.map((item, index) => (
              <CarouselItem key={`${item.id}-${index}`} className="basis-1/5">
                <Card
                  className={`h-28 w-28 ${
                    selectedIndex === index ? "bg-gray-300" : ""
                  }`}
                >
                  <CardContent className="h-full p-2 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <img
                        src={item.imagePath}
                        alt={`Item ${item.id}`}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-[#CBC5EA] h-8 w-8" />
          <CarouselNext className="bg-[#CBC5EA] h-8 w-8" />
        </Carousel>
      ) : (
        <div className="text-center text-gray-500 h-28">
          No items to display.
        </div>
      )}
    </div>
  );
}
