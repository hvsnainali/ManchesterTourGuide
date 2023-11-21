//importing necessary modules and components
import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Keyboard,
  TextInput,
} from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // caching data
import * as Location from "expo-location"; // getting user's location
import axios from "axios"; // API making HTTP requests
import * as Animatable from "react-native-animatable"; //  animations
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons"; // for icons
import {
  Hotels,
  Attractions,
  Restaurants,
  AttractionsStatic,
  RestaurantsStatic,
  HotelsStatic,
} from "../assets"; // images
import Category from "../components/Category"; // category component
import ItemContainer from "../components/ItemContainer"; // individual place component
import { debounce } from "lodash"; // lodash for debounce function
import { GOOGLE_API_KEY, INITIAL_RADIUS } from "@env"; // environment variable, security
import { getPlacesData } from "../api"; // API function
import { Modal, Button, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import ExploreScreen from "./ExploreScreen";
import geolib from "geolib"; //  geolocation functions
import { computeDestinationPoint } from "geolib";
import BottomBar from "../components/BottomBar"; //bottom navigation bar component
import PropTypes from "prop-types";

const Home = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [northeastCoords, setNortheastCoords] = useState(null);
  const [southwestCoords, setSouthwestCoords] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [destination, setDestination] = useState(null);

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("attractions");
  const [mainData, setMainData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);

  const filteredMainData = mainData
    ? mainData.filter(
        (data) =>
          data.name &&
          data.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  useEffect(() => {
    const getLocationAsync = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      // request the user location permission. if not granted, show an alert
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert(
          "Location Permission Required",
          "This app requires access to your location to provide a personalized experience. Please go to Settings and enable location permissions for this app.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
            //if permission not granted, allows the user to click on the popup which will alows them to navigate to settings, and allow.
          ]
        );
        return;
      }
      setLocationPermissionGranted(true);
      // If permission is granted, get the current position and set it to the location state
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    };

    //  async function
    getLocationAsync();
  }, []);

  useEffect(() => {
    if (location && locationPermissionGranted) {
      const apiKey = GOOGLE_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${INITIAL_RADIUS}&key=${apiKey}`;
      axios
        .get(url)
        .then((response) => {
          const results = response.data.results;
          if (results.length > 0) {
            // Calculate the bounding box coordinates based on the radius
            const northeast = computeDestinationPoint(
              location.coords,
              INITIAL_RADIUS,
              45
            );
            const southwest = computeDestinationPoint(
              location.coords,
              INITIAL_RADIUS,
              225
            );
            //setting the coords accordingly
            setNortheastCoords({
              latitude: northeast.latitude,
              longitude: northeast.longitude,
            });
            setSouthwestCoords({
              latitude: southwest.latitude,
              longitude: southwest.longitude,
            });
          } else {
            console.log("No results found");
          }
        })
        .catch((error) => {
          console.error(error);
          setErrorMsg("An error occurred while fetching location data.");
        });
    }
  }, [location, locationPermissionGranted]);

  // Fetching places data
  const fetchPlacesData = async (
    southwestCoords,
    northeastCoords,
    type,
    location
  ) => {
    setLoading(true);
    const cacheKey = `placesData:${type}:${JSON.stringify(
      southwestCoords
    )}:${JSON.stringify(northeastCoords)}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      const cacheDuration = 30 * 60 * 1000;

      // If the cache is still valid, use the cached data
      if (now - timestamp < cacheDuration) {
        setMainData(data);
        setLoading(false);
        return;
      }
    }

    getPlacesData(southwestCoords, northeastCoords, type, location).then(
      (data) => {
        setMainData(data);
        AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({ data, timestamp: Date.now() })
        );
        setLoading(false);
      }
    );
  };

  const debouncedFetchPlacesData = debounce(fetchPlacesData, 500);

  useEffect(() => {
    if (southwestCoords && northeastCoords) {
      debouncedFetchPlacesData(
        southwestCoords,
        northeastCoords,
        type,
        location
      );
    }
  }, [southwestCoords, northeastCoords, type, location]);

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <View className="flex-row items-center justify-between px-6">
        <View>
          <Text className="text-[20px] text-[#676767] font-regular">
            Hi there :)
          </Text>

          <Text className="text-[#00BCC9] text-[24px] font-semibold">
            Explore Manchester..
          </Text>
        </View>
        <View className="rounded-md items-center justify-center">
          <TouchableOpacity onPress={() => setShowSearchBar(!showSearchBar)}>
            <Animatable.View animation={"pulse"} iterationCount={"infinite"}>
              <FontAwesome name="search" size={22} color="#00BCC9" />
            </Animatable.View>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        {showSearchBar && (
          <TextInput
            className="absolute left-12 flex-row w-3/4 justify-center items-center border   border-cyan-400 p-2 rounded "
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
            placeholder="Search"
          />
        )}
      </View>

      <View className=" flex-row items-center justify-between px-8 mt-8">
        <Category
          key={"attractions"}
          title="Attractions"
          imageSrc={Attractions}
          staticImageSrc={AttractionsStatic}
          type={type}
          setType={setType}
        />
        <Category
          key={"hotels"}
          title="Hotels"
          imageSrc={Hotels}
          staticImageSrc={HotelsStatic}
          type={type}
          setType={setType}
        />
        <Category
          key={"restaurants"}
          title="Restaurants"
          imageSrc={Restaurants}
          staticImageSrc={RestaurantsStatic}
          type={type}
          setType={setType}
        />
      </View>

      <View className="flex-row items-center justify-between px-4 mt-6 ">
        <Text className="text-black text-[24px] font-bold">Nearby {type}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ExploreScreen")}
          className="flex-row items-center justify-center space-x-2"
        >
          <FontAwesome5 name="map" size={12} color="white" />
          <Text className="text-[#282828] text-[12px] font-semibold">
            Explore More of Manchester
          </Text>
          <FontAwesome name="arrow-right" size={20} color="#00BCC9" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View className=" flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00BCC9" />
        </View>
      ) : (
        <ScrollView>
          <View className="px-4 mt-4 flex-row items-center justify-evenly flex-wrap">
            {filteredMainData?.length > 0 ? (
              <>
                {filteredMainData?.map((data, i) => (
                  <ItemContainer
                    key={i}
                    imageSrc={
                      data?.photo?.images?.medium?.url
                        ? data?.photo?.images?.medium?.url
                        : "https://cdn.pixabay.com/photo/2015/10/30/12/22/eat-1014025_1280.jpg"
                    }
                    title={data?.name}
                    location={data?.location_string}
                    data={data}
                  />
                ))}
              </>
            ) : (
              <>
                <View className="w-full h-[400px] items-center space-y-8 justify-center">
                  <Text className="text-2xl text-[#428288] font-semibold">
                    loading... Data
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}
      {errorMsg && (
        <View className="absolute bottom-0 left-0 right-0 bg-red-600 py-2 px-4">
          <Text className="text-black text-center">{errorMsg}</Text>
        </View>
      )}
      <BottomBar />
    </SafeAreaView>
  );
};

export default Home;
