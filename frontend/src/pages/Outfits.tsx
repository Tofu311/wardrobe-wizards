import WheelCarousel from "../customComponents/WheelCarousel";
export default function Outfits() {
  const headwearItems = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    image_url: `https://wardrobe-wizard.nyc3.digitaloceanspaces.com/uploads/no-bg-673519e496b38f35f16a77f1.png`,
  }));

  const topItems = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    image_url: `https://wardrobe-wizard.nyc3.cdn.digitaloceanspaces.com/uploads/no-bg-6733deaab446ea96c93d0f1f.png`,
  }));

  const outerwearItems = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    image_url: `https://wardrobe-wizard.nyc3.digitaloceanspaces.com/uploads/no-bg-6733dafbb446ea96c93d0f15.png`,
  }));

  const bottomItems = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    image_url: `https://wardrobe-wizard.nyc3.digitaloceanspaces.com/uploads/no-bg-6733defbb446ea96c93d0f24.png`,
  }));

  const footwearItems = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    image_url: `https://wardrobe-wizard.nyc3.digitaloceanspaces.com/uploads/no-bg-6733db68b446ea96c93d0f1a.png`,
  }));

  // Sample selectedItems
  const selectedItems = {
    headwear: 3,
    top: 5,
    outerwear: 7,
    bottom: 2,
    footwear: 8,
  };

  return (
    <div>
      <h1>Outfits</h1>
      <div className="w-1/2 ml-12">
        <WheelCarousel
          headwear={headwearItems}
          top={topItems}
          outerwear={outerwearItems}
          bottom={bottomItems}
          footwear={footwearItems}
          selectedItems={selectedItems}
        />
      </div>
    </div>
  );
}
