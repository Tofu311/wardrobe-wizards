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
  items: { _id: string; imagePath: string }[];
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
  const totalItems = Math.max(MIN_ITEMS, items.length);
  const placeholderCount = totalItems - items.length;
  const leftPadding = Math.floor(placeholderCount / 2);
  const rightPadding = placeholderCount - leftPadding;

  const placeholderItems = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      _id: `placeholder-${i}`,
      imagePath: "",
    }));

  const displayItems = [
    ...placeholderItems(leftPadding),
    ...items,
    ...placeholderItems(rightPadding),
  ];

  // Initialize the carousel and set up the selected index listener
  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    // Initialize selectedIndex
    setSelectedIndex(api.selectedScrollSnap());

    api.on("select", onSelect);

    // Cleanup event listener on unmount
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Scroll to selectedItemId when the carousel is ready
  React.useEffect(() => {
    if (!api || selectedItemId === undefined || selectedItemId === null) return;

    const index = items.findIndex((item) => item._id === selectedItemId);

    if (index !== -1) {
      api.scrollTo(index);
    }
  }, [api, selectedItemId, items]);

  return (
    <div className="mb-8">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {displayItems.map((item, index) => (
            <CarouselItem
              key={item._id}
              className="basis-1/5 md:basis-1/5 lg:basis-1/5"
            >
              <div className="p-1">
                <Card
                  className={`${
                    selectedIndex === index ? "bg-[#FFF9DF]" : ""
                  } w-full aspect-square overflow-hidden`}
                >
                  <CardContent className="p-0 h-full flex items-center justify-center">
                    {item.imagePath ? (
                      <div className="relative w-full h-full">
                        <img
                          src={item.imagePath}
                          alt={`Item ${item._id}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-muted-foreground/20"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-[#CBC5EA]" />
        <CarouselNext className="bg-[#CBC5EA]" />
      </Carousel>
    </div>
  );
}
