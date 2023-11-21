import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Button,
  Linking,
  Share,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  useFocusEffect,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import { GOOGLE_API_KEY } from "@env";
import * as Animatable from "react-native-animatable";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExpPlace = ({ route }) => {
  const navigation = useNavigation();
  const place = route?.params?.param;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isFocused = useIsFocused();
  const [favourites, setFavourites] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const photoReference =
    place.photos && place.photos.length > 0
      ? place.photos[0].photo_reference
      : null;
  const photoUrl = photoReference
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`
    : null;

  const reviewText = place.reviews;
  const placeDescription = `${place.name}\n${place.rating} stars\n${reviewText}`;

  const sharePlace = async () => {
    try {
      const result = await Share.share({
        message: `Check out this Nice place: ${place.name}\n\nAddress: ${place.vicinity}`,
        url: place.web_url,
        title: "Share this place",
      });

      if (result.action === Share.sharedAction) {
        console.log("Place shared successfully!");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share action dismissed");
      }
    } catch (error) {
      console.error("An error occurred while sharing the place: ", error);
    }
  };

  const splitTextInPara = (text, sentencesPerPara) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const paragraphs = [];

    for (let i = 0; i < sentences.length; i += sentencesPerPara) {
      paragraphs.push(sentences.slice(i, i + sentencesPerPara).join(" "));
    }
    return paragraphs;
  };

  const textToSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(placeDescription, {
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const openUberApp = () => {
    const destinationLatitude = place.geometry?.latitude;
    const destinationLongitude = place.geometry?.longitude;

    const uberURL = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${destinationLatitude}&dropoff[longitude]=${destinationLongitude}`;

    Linking.canOpenURL(uberURL).then((supported) => {
      if (supported) {
        Linking.openURL(uberURL);
      } else {
        console.log("Can't open the Uber app, please download the app.");
      }
    });
  };
  useEffect(() => {
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

    if (isFocused) {
      fetchFavourites();
    }
  }, [isFocused]);

  const handleFavourite = async () => {
    try {
      const isFavourite = favourites.some(
        (favourite) => favourite.place_id === place.place_id
      );

      if (isFavourite) {
        const updatedFavourites = favourites.filter(
          (favourite) => favourite.place_id !== place.place_id
        );
        setFavourites(updatedFavourites);
        await AsyncStorage.setItem(
          "favourites",
          JSON.stringify(updatedFavourites)
        );
      } else {
        const updatedFavourites = [...favourites, place];
        setFavourites(updatedFavourites);
        await AsyncStorage.setItem(
          "favourites",
          JSON.stringify(updatedFavourites)
        );
      }
    } catch (error) {
      console.error("Error updating favourite places:", error);
    }
  };

  const isFavourite = favourites.some(
    (favourite) => favourite.place_id === place.place_id
  );

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <ScrollView className="px-4 py-6">
        <View className="relative bg-white shadow-lg">
          <Image
            source={{
              uri: photoUrl
                ? photoUrl
                : "https://cdn.pixabay.com/photo/2015/10/30/12/22/eat-1014025_1280.jpg",
            }}
            className="w-full h-72 object-cover rounded-2xl"
          />
          <View className="absolute flex-row inset-x-0 top-5 justify-between px-6">
            <TouchableOpacity
              onPress={() => navigation.navigate("ExploreScreen")}
              className="w-10 h-10 rounded-md items-center justify-center"
            >
              <Animatable.View animation={"pulse"} iterationCount={"infinite"}>
                <FontAwesome5 name="chevron-left" size={26} color="#00BCC9" />
              </Animatable.View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFavourite}
              className="w-10 h-10 rounded-md items-center justify-center"
            >
              <Animatable.View animation={"pulse"} iterationCount={10}>
                <FontAwesome
                  name={isFavourite ? "heart" : "heart-o"}
                  size={26}
                  color={"#00BCC9"}
                />
              </Animatable.View>
            </TouchableOpacity>
          </View>

          <View className="absolute flex-row inset-x-0 bottom-5 justify-between px-6">
            {place.price_level && (
              <View className="flex-row space-x-2 items-center">
                <Text className="text-[10px] font-bold text-white">
                  {place.price_level}
                </Text>
                <Text className="text-[30px] font-bold text-white">
                  {place.price}
                </Text>
              </View>
            )}

            {place.opening_hours && place.opening_hours.open_now ? (
              <View className="items-center justify-center px-2 py-1 rounded-md bg-cyan-100">
                <Text>Open Now</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-[#00BCC9] text-[24px] font-bold">
            {place.name}
          </Text>
          <View className="flex-row items-center space-x-2 mt-2">
            <FontAwesome name="map-marker" size={18} color="#00BCC9" />
            <Text className="text-black text-[14px] font-bold">
              {place.vicinity}
            </Text>
          </View>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          {place?.distance && (
            <View className="items-center flex-row ">
              <View className="w-10 h-10 rounded-2xl items-center justify-center ">
                <Ionicons name="ios-pin" size={14} color="#D58574" />
              </View>
              <View className="relative right-3 items-center justify-center">
                <Text className="text-md">{place?.distance}</Text>
              </View>
            </View>
          )}

          {place?.price_level && (
            <View className="flex-row items-center ">
              <View className="w-10 h-10 rounded-2xl items-center justify-center ">
                <FontAwesome5 name="pound-sign" size={18} color="#515151" />
              </View>
              <View className="relative right-2 items-center justify-center">
                <Text className="text-black">{place?.price_level}</Text>
                <Text className="text-black">Price Level</Text>
              </View>
            </View>
          )}

          {place?.rating && (
            <View className=" flex-row items-center space-x-1">
              <View className="w-10 h-10 rounded-2xl items-center justify-center ">
                <FontAwesome name="star" size={20} color="#D68686" />
              </View>
              <View className="relative right-2 items-center justify-center">
                <Text className="text-black">{place?.rating}</Text>
                <Text className="text-black">Ratings</Text>
              </View>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between bottom-2">
          {place?.website && (
            <View className="items-center flex-row">
              <View className=" w-10 h-10 rounded-2xl items-center justify-center ">
                <FontAwesome5 name="money-check" size={14} color="#515151" />
              </View>
              <View className="relative items-center justify-center">
                <Animatable.View animation={"pulse"} iterationCount={4}>
                  <Text
                    className="text-[#00BCC9] font-medium"
                    style={{ textDecorationLine: "underline" }}
                  >
                    Order now
                  </Text>
                </Animatable.View>
              </View>
            </View>
          )}
          <TouchableOpacity onPress={openUberApp}>
            <View className=" flex-row mr-5">
              <View className=" w-10 h-10 rounded-1xl items-center justify-center left-1">
                <FontAwesome5 name="car" size={14} color="#515151" />
              </View>
              <View className="relative items-center justify-center">
                <Text
                  className="text-[#00BCC9] font-normal "
                  style={{ textDecorationLine: "underline" }}
                >
                  Book Uber Ride to{" "}
                  {place?.name.length > 12
                    ? `${place?.name.slice(0, 12)}..`
                    : place?.name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {place?.user_ratings_total && (
          <View className=" flex-row items-center bottom-4 border-[#515151] border-b-2">
            <View className="w-10 h-10 rounded-1xl  items-center justify-center ">
              <Ionicons
                name="information"
                size={18}
                color="#D68686"
                className="bottom-2"
              />
            </View>
            <Text className="text-[#515151] ">
              Ranking : {place?.user_ratings_total}
            </Text>
            <Text></Text>
          </View>
        )}

        {placeDescription && (
          <>
            {splitTextInPara(placeDescription, 2).map((paragraph, index) => (
              <Text
                key={index}
                className="mt-1 text-[14px] tracking-wide font-semibold text-[#515151]"
              >
                {paragraph}
              </Text>
            ))}

            <View className="mt-2">
              <TouchableOpacity
                onPress={textToSpeech}
                className="items-center justify-center flex-row"
              >
                <FontAwesome
                  name={isSpeaking ? "stop" : "volume-up"}
                  size={20}
                  color="#06B2BE"
                />
                <Text className="text-[#06B2BE] text-[16px] font-semibold ml-2">
                  {isSpeaking ? "Stop Listening" : "Listen"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View className="space-y-1 mt-4 bg-cyan-100 rounded-2xl px-4 py-2 mr-4">
          <View className="flex-row w-20 h-7 mb-4 items-center  top-2">
            <TouchableOpacity
              onPress={sharePlace}
              className="bg-cyan-500 p-2 rounded flex "
            >
              <FontAwesome name="share-alt" size={10} color="white" />
              <Text className="text-white text-sm items-center justify-center">
                Share
              </Text>
            </TouchableOpacity>
          </View>
          {place?.name && (
            <View className="items-center flex-row ">
              <TouchableOpacity>
                <Text className="text-md font-bold uppercase">
                  {place?.name}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {place?.vicinity && (
            <View className=" flex-row items-center space-x-3 ">
              <FontAwesome5 name="map" size={18} color="#00BCC9" />
              <Text className="text-md">{place?.vicinity}</Text>
            </View>
          )}

          <TouchableOpacity className=" flex-row mt-2 px-4 py-4 rounded-lg bg-[#00BCC9] items-center justify-center mb-4">
            <Text className="text-1xl font-semibold uppercase tracking-wider text-white">
              Directions On Map
            </Text>
            <Animatable.View animation={"pulse"} iterationCount={"infinite"}>
              <FontAwesome name="location-arrow" size={18} color="white" />
            </Animatable.View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExpPlace;
