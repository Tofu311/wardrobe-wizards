// CarouselComponent.jsx
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

export default function CarouselComponent({ items, selectedItemId, title }) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

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

    const index = items.findIndex((item) => item.id === selectedItemId);

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
          {items.map((item, index) => (
            <CarouselItem key={index} className="basis-1/5">
              <Card
                className={`${selectedIndex === index ? "bg-[#FFF9DF]" : ""}`}
              >
                <CardContent className="h-24 flex items-center justify-center">
                  <img
                    src={item.image_url}
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
