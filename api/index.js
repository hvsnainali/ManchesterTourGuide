import axios from "axios";
import { RAPID_API } from "@env";

export const getPlacesData = async (
  southwestCoords,
  northeastCoords,
  type,
  location
) => {
  try {
    let url;
    let params;

    if ((type === "hotels" || type === "restaurants") && location) {
      url = `https://travel-advisor.p.rapidapi.com/${type}/list-by-latlng`;
      params = {
        latitude: location?.latitude,
        longitude: location?.longitude,
        currency: "GBP",
        lunit: "mi",
        lang: "en_UK",
      };
    } else {
      url = `https://travel-advisor.p.rapidapi.com/attractions/list-in-boundary`;
      params = {
        tr_longitude: northeastCoords.longitude,
        tr_latitude: northeastCoords.latitude,
        bl_longitude: southwestCoords.longitude,
        bl_latitude: southwestCoords.latitude,
        limit: "30",
        currency: "GBP",
        lunit: "mi",
        lang: "en_UK",
      };
    }
    const {
      data: { data },
    } = await axios.get(url, {
      params: params,
      headers: {
        "X-RapidAPI-Key": RAPID_API,
        "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
      },
    });

    return data;
    console.error(" fetched places data:", error);
  } catch (error) {
    console.error("Error fetching places data:", error);
    return null;
  }
};
