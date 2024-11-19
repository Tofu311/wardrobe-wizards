import { useEffect, useState } from "react";
import WheelCarousel from "../customComponents/WheelCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClothingItem } from "@/types/types";

// const API_ROOT = "http://localhost:3000/api"; // local
const API_ROOT = "https://api.wardrobewizard.fashion/api"; // prod

export default function Outfits() {
  // Sample selectedItems with string IDs
  /*
  const selectedItems = {
    headwear: "3",
    top: "5",
    outerwear: "7",
    bottom: "2",
    footwear: "8",
  };*/

  const [headwear, setHeadwear] = useState<ClothingItem[]>([]);
  const [top, setTop] = useState<ClothingItem[]>([]);
  const [outerwear, setOuterwear] = useState<ClothingItem[]>([]);
  const [bottom, setBottom] = useState<ClothingItem[]>([]);
  const [footwear, setFootwear] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    headwear?: string;
    top?: string;
    outerwear?: string;
    bottom?: string;
    footwear?: string;
  }>({});

  const fetchClothingByType = async (type: string) => {
    try {
      const response = await fetch(
        `${API_ROOT}/clothing?clothingType=${type}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch clothing type: ${type}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return [];
    }
  };

  const fetchAllClothing = async () => {
    const headwearData = await fetchClothingByType("HEADWEAR");
    const outerwearData = await fetchClothingByType("OUTERWEAR");
    const topData = await fetchClothingByType("TOP");
    const bottomData = await fetchClothingByType("BOTTOM");
    const footwearData = await fetchClothingByType("FOOTWEAR");

    setHeadwear(headwearData);
    setOuterwear(outerwearData);
    setTop(topData);
    setBottom(bottomData);
    setFootwear(footwearData);
  };

  /*
  useEffect(() => {
    const token = window.localStorage.getItem("token");

    Promise.all([
      fetch("https://api.wardrobewizard.fashion/api/clothing?type=HEADWEAR", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }).then((response) => response.json()),

      fetch("https://api.wardrobewizard.fashion/api/clothing?type=OUTERWEAR", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }).then((response) => response.json()),

      fetch("https://api.wardrobewizard.fashion/api/clothing?type=TOP", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }).then((response) => response.json()),

      fetch("https://api.wardrobewizard.fashion/api/clothing?type=BOTTOM", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }).then((response) => response.json()),

      fetch("https://api.wardrobewizard.fashion/api/clothing?type=FOOTWEAR", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }).then((response) => response.json()),
    ])
      .then(
        ([
          headwearsData,
          outerwearsData,
          topsData,
          bottomsData,
          footwearsData,
        ]) => {
          setHeadwears(headwearsData);
          setOuterwears(outerwearsData);
          setTops(topsData);
          setBottoms(bottomsData);
          setFootwears(footwearsData);
        }
      )
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);*/

  useEffect(() => {
    fetchAllClothing();
  }, []);

  return (
    <div className="flex">
      <div className="flex-col w-2/3 bg-[#183642]">
        <h1 className="m-8 mb-2 text-[#FEFFF3] font-bold">Today's Vibe</h1>
        <div className="w-1/2 flex gap-4 mx-8 mt-0 mb-4">
          <Input placeholder="ie. Headed to Class"></Input>
          <Button className="bg-[#CBC5EA] border-2 border-[#73628A] text-[#73628A] font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </Button>
        </div>

        <div className="w-5/6 ml-16">
          <WheelCarousel
            headwear={headwear}
            top={top}
            outerwear={outerwear}
            bottom={bottom}
            footwear={footwear}
            selectedItems={selectedItems}
          />
        </div>
      </div>
      <div className="flex-col bg-[#FEFFF3] w-1/2 h-screen"></div>
    </div>
  );
}
