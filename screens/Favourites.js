import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { GOOGLE_API_KEY } from "@env";
import { useNavigation } from "@react-navigation/native";

const Favourites = () => {
  const navigation = useNavigation();
  const [favourites, setFavourites] = useState([]);

  const fetchFavourites = async () => {
    try {
      const favList = await AsyncStorage.getItem("favourites");
      if (favList) {
        setFavourites(JSON.parse(favList));
      }
    } catch (error) {
      console.error("Error fetching favourite places:", error);
    }
  };

  const removeFavourite = async (placeId) => {
    try {
      const updatedFavourites = favourites.filter(
        (place) => place.place_id !== placeId
      );
      setFavourites(updatedFavourites);
      await AsyncStorage.setItem(
        "favourites",
        JSON.stringify(updatedFavourites)
      );
    } catch (error) {
      console.error("Error removing favourite place:", error);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Favourite Places</Text>
      <ScrollView>
        {favourites.map((place, index) => {
          const photoUrl = place.photos
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : null;
          return (
            <TouchableOpacity key={index}>
              <View className="bg-gray-200 m-2 p-4 rounded-lg">
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ExpPlace", {
                      param: place,
                    })
                  }
                >
                  {photoUrl && (
                    <Image
                      source={{ uri: photoUrl }}
                      className="w-24 h-24 mb-2"
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>

                <Text className="text-lg font-bold mb-2">{place.name}</Text>
                <Text className="text-gray-500">{place.vicinity}</Text>
                <TouchableOpacity
                  onPress={() => removeFavourite(place.place_id)}
                  className="mt-2"
                >
                  <FontAwesome name="trash-o" size={24} color="#ff0000" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Favourites;
