import { useEffect, useState } from "react";
import WheelCarousel from "../customComponents/WheelCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import SelectedOutfit from "../customComponents/SelectedOutfit";

// const API_ROOT = "http://localhost:3000/api"; // local
const API_ROOT = "https://api.wardrobewizard.fashion/api"; // prod

interface ClothingMap {
  [key: string]: string; // Map from item ID to clothing type
}

export default function Outfits() {
  const [prompt, setPrompt] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [headwears, setHeadwears] = useState([]);
  const [outerwears, setOuterwears] = useState([]);
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);
  const [footwears, setFootwears] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    const handleFetch = (clothingType) => {
      return fetch(`${API_ROOT}/clothing?clothingType=${clothingType}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            navigate("/");
            throw new Error("Unauthorized");
          }
          return response.json();
        })
        .catch((error) => {
          if (
            error instanceof TypeError &&
            error.message === "Failed to fetch"
          ) {
            // Likely a CORS error due to unauthorized access
            navigate("/");
            throw new Error("CORS error or network issue");
          } else {
            // Handle other types of errors if necessary
            throw error;
          }
        });
    };

    Promise.all([
      handleFetch("HEADWEAR"),
      handleFetch("OUTERWEAR"),
      handleFetch("TOP"),
      handleFetch("BOTTOM"),
      handleFetch("FOOTWEAR"),
    ])
      .then(
        ([
          headwearsData,
          outerwearsData,
          topsData,
          bottomsData,
          footwearsData,
        ]) => {
          // Map _id to id and add clothingType to each item
          setHeadwears(
            headwearsData.map((item) => ({
              ...item,
              id: item._id,
              clothingType: "headwear",
            }))
          );
          setOuterwears(
            outerwearsData.map((item) => ({
              ...item,
              id: item._id,
              clothingType: "outerwear",
            }))
          );
          setTops(
            topsData.map((item) => ({
              ...item,
              id: item._id,
              clothingType: "top",
            }))
          );
          setBottoms(
            bottomsData.map((item) => ({
              ...item,
              id: item._id,
              clothingType: "bottom",
            }))
          );
          setFootwears(
            footwearsData.map((item) => ({
              ...item,
              id: item._id,
              clothingType: "footwear",
            }))
          );
        }
      )
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Function to handle generating an outfit based on the prompt
  const handleGenerateOutfit = async () => {
    const token = window.localStorage.getItem("token");

    try {
      const response = await fetch(`${API_ROOT}/clothing/generateOutfit`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const outfitItemIds = data.outfitItemIds;

      console.log("Outfit item IDs:", outfitItemIds);

      // Combine all clothing items into one array
      const allClothingItems = [
        ...headwears,
        ...outerwears,
        ...tops,
        ...bottoms,
        ...footwears,
      ];

      console.log("All clothing items:", allClothingItems);

      // Create a map from item ID to clothing type
      const itemIdToClothingType: ClothingMap = {};
      allClothingItems.forEach((item: { id: string; clothingType: string }) => {
        itemIdToClothingType[item.id] = item.clothingType;
      });

      console.log("Item ID to clothing type mapping:", itemIdToClothingType);

      // Build the selectedItems object based on the outfitItemIds
      const newSelectedItems: Record<string, string> = {};
      outfitItemIds.forEach((itemId: string) => {
        const clothingType = itemIdToClothingType[itemId];
        console.log(
          `For itemId ${itemId}, found clothingType: ${clothingType}`
        );
        if (clothingType) {
          newSelectedItems[clothingType] = itemId;
        }
      });

      console.log("New selected items:", newSelectedItems);

      // Update the selectedItems state
      setSelectedItems(newSelectedItems);
    } catch (error) {
      console.error("Error generating outfit:", error);
    }
  };

  return (
    <div className="flex">
      <nav className="w-full bg-[#313D5A] p-2 flex justify-between items-center fixed top-0 left-0 z-50">
        <h1 className="text-[#CBC5EA] text-2xl font-bold ml-4">
          Wardrobe Wizard
        </h1>
        <div className="flex space-x-4">
          <Button
            onClick={() => {
              navigate("/closet");
            }}
          >
            Closet
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
      <div className="flex-col w-[60%] bg-[#183642]">
        <h1 className="m-8 mt-16 mb-2 text-[#FEFFF3] text-sm font-bold">
          Today's Vibe
        </h1>
        <div className="w-1/2 flex gap-4 mx-8 mt-0 mb-4">
          <Input
            placeholder="e.g., Headed to Class"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button
            className="bg-[#CBC5EA] border-2 border-[#73628A] text-[#73628A] font-bold"
            onClick={handleGenerateOutfit}
          >
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

        <div className="w-[75%] ml-16">
          <WheelCarousel
            headwear={headwears}
            outerwear={outerwears}
            top={tops}
            bottom={bottoms}
            footwear={footwears}
            selectedItems={selectedItems}
          />
        </div>
      </div>
      <div className="flex-col bg-[#FEFFF3] w-1/2 h-screen">
        <SelectedOutfit
          selectedItems={selectedItems}
          allItems={[
            ...headwears,
            ...outerwears,
            ...tops,
            ...bottoms,
            ...footwears,
          ]}
        />
      </div>
    </div>
  );
}
