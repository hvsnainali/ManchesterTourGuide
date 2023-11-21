import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import {
  FontAwesome5,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import { GOOGLE_API_KEY } from "@env";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Category from "../components/Category";
import {
  Dj,
  DjStatic,
  Gym,
  GymStatic,
  Bank,
  BankStatic,
  Museum,
  MosqueStatic,
  LocalGovern,
  LocalGovernStatic,
  Park,
  ParkStatic,
  Church,
  ChurchStatic,
  Mosque,
  MuseumStatic,
  Cinema,
  CinemaStatic,
  Atm,
  AtmStatic,
  Store,
  StoreStatic,
  Restaurants,
  RestaurantsStatic,
} from "../assets";

const ExploreScreen = () => {
  const [type, setType] = useState("atm");
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [places, setPlaces] = useState([]);
  const [searchText, setSearchText] = useState("");
  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchText.toLowerCase())
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      getNearbyPlaces(type);
    }
  }, [location, type]);

  const handleCategoryPress = (newType) => {
    setType(newType);
    getNearbyPlaces(newType);
  };

  const getNearbyPlaces = async (type) => {
    if (!location) {
      alert("We couldn't get your location, please try again.");
      return;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=1500&type=${type}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();
    setPlaces(data.results);
  };

  const placeElements = filteredPlaces.map((place) => {
    const photoReference =
      place.photos && place.photos.length > 0
        ? place.photos[0].photo_reference
        : null;
    const photoUrl = photoReference
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`
      : null;

    const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${location.coords.latitude},${location.coords.longitude}&destinations=place_id:${place.place_id}&key=${GOOGLE_API_KEY}`;

    fetch(distanceUrl)
      .then((response) => response.json())
      .then((data) => {
        if (
          data.rows &&
          data.rows.length > 0 &&
          data.rows[0].elements.length > 0
        ) {
          place.distanceText = data.rows[0].elements[0].distance.text;
        }
      });

    return (
      <TouchableOpacity
        key={place.place_id}
        onPress={() =>
          navigation.navigate("ExpPlace", {
            param: place,
          })
        }
        className="rounded-md border border-gray-300 space-y-2 px-3 py-2 shadow-md bg-white w-[182px] my-2 mx-2"
      >
        {photoUrl && (
          <Image
            source={{ uri: photoUrl }}
            className="w-full h-40 rounded-md object-cover"
          />
        )}
        <Text className="text-black text-[18px] font-bold">
          {place.name.length > 14 ? `${place.name.slice(0, 14)}..` : place.name}
        </Text>
        <View className="flex-row items-center space-x-1">
          <FontAwesome name="map-marker" size={18} color="#00bcc9" />
          <Text className="text-[#428288] text-[14px] font-bold">
            {place.vicinity.length > 18
              ? `${place.vicinity.slice(0, 18)}..`
              : place.vicinity}
          </Text>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="relative flex-row inset-x-0 top-5 justify-between px-6">
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Animatable.View animation={"pulse"} iterationCount={5}>
            <FontAwesome5 name="chevron-left" size={26} color="#06B2BE" />
          </Animatable.View>
        </TouchableOpacity>

        <TextInput
          className="relative flex-row w-2/3 border  border-cyan-400 p-2 rounded "
          onChangeText={(text) => setSearchText(text)}
          value={searchText}
          placeholder="Search Places"
        />
        <TouchableOpacity className="flex-row right-9 top-1">
          <FontAwesome name="search" size={20} color="#00bcc9" />
        </TouchableOpacity>
      </View>
      <View className="realtive flex-row mt-8 mx-2 ">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          <Category
            key={"atm"}
            title="atm"
            imageSrc={Atm}
            staticImageSrc={AtmStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"bank"}
            title="bank"
            imageSrc={Bank}
            staticImageSrc={BankStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"movie_theater"}
            title="Movie_theater"
            imageSrc={Cinema}
            staticImageSrc={CinemaStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"cafe"}
            title="Cafe"
            imageSrc={Restaurants}
            staticImageSrc={RestaurantsStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"local_government_office"}
            title="Local_government_office"
            imageSrc={LocalGovern}
            staticImageSrc={LocalGovernStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"night_club"}
            title="Night_club"
            imageSrc={Dj}
            staticImageSrc={DjStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"mosque"}
            title="mosque"
            imageSrc={Mosque}
            staticImageSrc={MosqueStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"church"}
            title="Church"
            imageSrc={Church}
            staticImageSrc={ChurchStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"gym"}
            title="gym"
            imageSrc={Gym}
            staticImageSrc={GymStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"shopping_mall"}
            title="shopping_mall"
            imageSrc={Store}
            staticImageSrc={StoreStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"museum"}
            title="museum"
            imageSrc={Museum}
            staticImageSrc={MuseumStatic}
            type={type}
            setType={handleCategoryPress}
          />
          <Category
            key={"Library"}
            title="Library"
            imageSrc={LocalGovern}
            staticImageSrc={LocalGovern}
            type={type}
            setType={handleCategoryPress}
          />
        </ScrollView>
      </View>

      <ScrollView>
        <View className="flex-row flex-wrap justify-center pt-5">
          {placeElements}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreScreen;
