// CarouselComponent.tsx
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

// Define prop types
interface CarouselComponentProps {
  items: { id: string; imagePath: string }[];
  selectedItemId?: string;
  title?: string;
}

export default function CarouselComponent({
  items,
  selectedItemId,
}: CarouselComponentProps) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  const MIN_ITEMS = 5;

  // Create duplicate item array to fill carousel
  const displayItems = React.useMemo(() => {
    if (items.length === 0) return [];
    if (items.length >= MIN_ITEMS) return items;

    // Calculate how many times we need to repeat the items
    const repetitions = Math.ceil(MIN_ITEMS / items.length);
    return Array.from({ length: repetitions }, () =>
      items.map((item, idx) => ({ ...item, id: `${item.id}-${idx}` }))
    ).flat();
  }, [items]);

  // Initialize the carousel and set up the selected index listener
  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    // Initialize selectedIndex
    setSelectedIndex(api.selectedScrollSnap());

    api.on("select", onSelect);
    api.on("settle", onSelect);

    // Cleanup event listener on unmount
    return () => {
      api.off("select", onSelect);
      api.off("settle", onSelect);
    };
  }, [api]);

  // Scroll to selectedItemId when the carousel is ready
  React.useEffect(() => {
    if (!api || selectedItemId === undefined || selectedItemId === null) return;

    const index = displayItems.findIndex((item) => item.id === selectedItemId);

    if (index !== -1) {
      api.scrollTo(index);
    }
  }, [api, selectedItemId, displayItems]);

  return (
    <div className="mb-8">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
          skipSnaps: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {displayItems.map((item, index) => (
            <CarouselItem key={`${item.id}-${index}`} className="basis-1/5">
              <Card
                className={`${
                  selectedIndex === index ? "bg-[#FFF9DF]" : ""
                } transition-colors`}
              >
                <CardContent className="h-24 flex items-center justify-center">
                  <img
                    src={item.imagePath}
                    alt={`Item ${item.id}`}
                    width={150}
                    height={150}
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-[#CBC5EA]" />
        <CarouselNext className="bg-[#CBC5EA]" />
      </Carousel>
    </div>
  );
}
