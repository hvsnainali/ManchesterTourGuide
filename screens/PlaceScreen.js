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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDistance } from "geolib";
import { getPlaceDetails } from "../api";
import * as Location from "expo-location";
import { GOOGLE_API_KEY } from "@env";
import * as Animatable from "react-native-animatable";
import * as Speech from "expo-speech";
import { fetchFavourites, handleFavourite } from "./ExpPlace";

const PlaceScreen = ({ route }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const data = route?.params?.param;
  const [location, setLocation] = useState(null);
  const [mapStyle, setMapStyle] = useState("standard");
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  const mapViewRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const handleModalVisibility = () => {
    setModalVisible(!modalVisible);
  };

  const fitMapToMarkers = (result) => {
    if (mapViewRef.current) {
      mapViewRef.current.fitToCoordinates(
        [
          {
            latitude: location?.latitude,
            longitude: location?.longitude,
          },
          {
            latitude: data.latitude,
            longitude: data.longitude,
          },
        ],
        {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        }
      );
      const InMiles = result.distance * 0.621371;
      setDistance(InMiles);
      setDuration(result.duration);
    }
  };

  const openUberApp = () => {
    const destinationLatitude = data.latitude;
    const destinationLongitude = data.longitude;

    const uberURL = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${destinationLatitude}&dropoff[longitude]=${destinationLongitude}`;

    Linking.canOpenURL(uberURL).then((supported) => {
      if (supported) {
        Linking.openURL(uberURL);
      } else {
        console.log("Can't open the Uber app, please download the app.");
      }
    });
  };

  const sharePlace = async () => {
    try {
      const result = await Share.share({
        message: `Check out this Nice place: ${data.name}\n\nAddress: ${data.location_string}`,
        url: data.web_url,
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
      Speech.speak(data.description, {
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const formatPhNumber = (phoneNumber) => {
    return phoneNumber.replace(/\D+/g, "");
  };

  const dialPhoneNumber = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Unable to dial the number");
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const openEmail = (email) => {
    const url = `mailto:${email}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Unable to send email");
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const openExternalApp = () => {
    const url = Platform.select({
      ios: `maps://app?daddr=${data.latitude},${data.longitude}`,
      android: `geo:${data.latitude},${data.longitude}`,
    });

    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  const openInWaze = () => {
    const wazeUrl = Platform.select({
      ios: `waze://?ll=${data.latitude},${data.longitude}&navigate=yes`,
      android: `https://waze.com/ul?ll=${data.latitude},${data.longitude}&navigate=yes`,
    });

    Linking.canOpenURL(wazeUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(wazeUrl);
        } else {
          console.log("Can't open Waze URL");
          alert("Waze app is not installed on your device.");
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const showSettingsPanel = () => {
    Alert.alert(
      "Map Settings",
      "Change the map style",
      [
        {
          text: "Standard",
          onPress: () => setMapStyle("standard"),
        },
        {
          text: "Satellite",
          onPress: () => setMapStyle("satellite"),
        },
        {
          text: "Close",
          onPress: () => {},
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  {
    /* Stop the speech if the user nagivates out of the screen*/
  }
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (isSpeaking) {
          Speech.stop();
        }
      };
    }, [isSpeaking])
  );

  const toggleFavourite = () => {
    setIsFavourite(!isFavourite);
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
      } catch (error) {
        console.log("Error fetching location:", error);
        alert("Error fetching location. Please try again later.");
      }
    })();
  }, []);

  useEffect(() => {
    const checkIfFavourite = async () => {
      const item = await AsyncStorage.getItem(`savedPlace-${data.id}`);
      setIsFavourite(item !== null);
    };

    checkIfFavourite();
  }, [data]);

  const handleFavourite = async () => {
    if (isFavourite) {
      await AsyncStorage.removeItem(`savedPlace-${data.id}`);
    } else {
      await AsyncStorage.setItem(`savedPlace-${data.id}`, JSON.stringify(data));
    }
    setIsFavourite(!isFavourite);
  };

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <ScrollView className="flex-1 px-4 py-6">
        <View className="relative bg-white shadow-lg">
          {/* Image of the place */}
          <Image
            source={{
              uri: data?.photo?.images?.large?.url
                ? data?.photo?.images?.large?.url
                : "https://cdn.pixabay.com/photo/2015/10/30/12/22/eat-1014025_1280.jpg",
            }}
            className="w-full h-72 object-cover rounded-2xl"
          />
          <View className="absolute flex-row inset-x-0 top-5 justify-between px-6">
            {/* Navigation back to home */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              className="w-10 h-10 rounded-md items-center justify-center"
            >
              <Animatable.View animation={"pulse"} iterationCount={"infinite"}>
                <FontAwesome5 name="chevron-left" size={26} color="#06B2BE" />
              </Animatable.View>
            </TouchableOpacity>
            {/* Add to Favorite, heart icon */}
            <TouchableOpacity
              onPress={toggleFavourite}
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
          {/* DATA.PRICE , SHOWS THE PRICE LEVEL FOR BETTER EXPERIENCE */}
          <View className="absolute flex-row inset-x-0 bottom-5 justify-between px-6">
            <View className="flex-row space-x-2 items-center">
              <Text className="text-[10px] font-bold text-white">
                {data?.price_level}
              </Text>
              <Text className="text-[30px] font-bold text-white">
                {data?.price}
              </Text>
            </View>
            {/* DATA.OPEN NOW , TELLS IF THE DESTINATIONS IS OPEN FOR BETTER EXPERIENCE */}
            {data?.open_now_text && data.open_now_text.trim() !== "" ? (
              <View className="items-center justify-center px-2 py-1 rounded-md bg-cyan-100">
                <Text>{data.open_now_text}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-6">
          {/* DATA.NAME , NAME OF THE LCOATION */}
          <Text className="text-[#00BCC9] text-[24px] font-bold">
            {data?.name}
          </Text>
          <View className="flex-row items-center space-x-2 mt-2">
            <FontAwesome name="map-marker" size={18} color="#00BCC9" />
            <Text className="text-black text-[14px] font-bold">
              {/* ADDRESS LOCATION */}
              {data?.location_string}
            </Text>
          </View>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          {/*  HOW FAR THE DESTINATION IS FROM THE USERS CURRENT LOCATION*/}
          {data?.distance_string && (
            <View className="items-center flex-row ">
              <View className="w-10 h-10 rounded-2xl items-center justify-center ">
                <Ionicons name="ios-pin" size={14} color="#D58574" />
              </View>
              <View className="relative right-3 items-center justify-center">
                <Text className="text-md">{data?.distance_string}</Text>
              </View>
            </View>
          )}

          {data?.price_level && (
            <View className=" flex-row items-center ">
              <View className="w-10 h-10 rounded-2xl items-center justify-center ">
                <FontAwesome5 name="pound-sign" size={20} color="#515151" />
              </View>
              <View className="relative right-2 items-center justify-center">
                <Text className="text-black">{data?.price}</Text>
                <Text className="text-black">Price Level</Text>
              </View>
            </View>
          )}
          {/* THE BEARING IS DISPLAYED */}
          {data?.bearing && (
            <View className=" flex-row items-center ">
              <View className="w-10 h-10 rounded-2xl items-center justify-center ">
                <FontAwesome name="map-signs" size={20} color="#515151" />
              </View>
              <View className="relative right-1 items-center justify-center">
                <Text className="text-black capitalize">{data?.bearing}</Text>
                <Text className="text-black">Bearing</Text>
              </View>
            </View>
          )}
          {/* THE RATING IS DISPLAYED */}
          {data?.rating && (
            <View className=" flex-row items-center space-x-1">
              <View className="w-10 h-10 rounded-2xl items-center justify-center ">
                <FontAwesome name="star" size={20} color="#D68686" />
              </View>
              <View className="relative right-2 items-center justify-center">
                <Text className="text-black">{data?.rating}</Text>
                <Text className="text-black">Ratings</Text>
              </View>
            </View>
          )}
        </View>
        {/* Allows the user to book.order from the screen  */}
        <View className="flex-row items-center justify-between bottom-2">
          {data?.booking?.url && (
            <TouchableOpacity onPress={() => Linking.openURL(data.booking.url)}>
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
            </TouchableOpacity>
          )}

          {/* Allows the user to open uber and book a ride, having the app automatically put the destination */}
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
                  {/* if the text is longer than 12chars have{..} this is more appealing  */}
                  Book Uber Ride to{" "}
                  {data?.name.length > 12
                    ? `${data?.name.slice(0, 12)}..`
                    : data?.name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        {/* THE RANKING IS DISPLAYED */}
        {data?.ranking && (
          <View className=" flex-row items-center bottom-4 border-[#515151] border-b-2">
            <View className="w-10 h-10 rounded-1xl  items-center justify-center ">
              <Ionicons
                name="information"
                size={18}
                color="#D68686"
                className="bottom-2"
              />
            </View>
            <Text className="text-[#515151] ">Ranking : {data?.ranking}</Text>
            <Text></Text>
          </View>
        )}
        {/* THE Description IS DISPLAYED */}
        {data?.description && (
          <>
            {splitTextInPara(data?.description, 2).map((paragraph, index) => (
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
                {/* The play and stop speech toggle IS DISPLAYED */}
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
        <View className="flex-row items-center justify-between mr-2">
          {data?.cuisine && (
            <View className="flex-row gap-2 items-center justify-start flex-wrap mt-4">
              {data?.cuisine.map((n) => (
                <TouchableOpacity
                  key={n.key}
                  className="px-2 py-1 rounded-md bg-green-100"
                >
                  <Text>{n.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="space-y-2 mt-4 bg-cyan-100  rounded-2xl px-4 py-2 ">
          <View className="flex-row w-18 h-7 mb-4 items-center top-2">
            <TouchableOpacity
              onPress={sharePlace}
              className="bg-cyan-500 p-2 rounded flex  opacity-90"
            >
              <FontAwesome name="share-alt" size={10} color="white" />
              <Text className="text-white text-sm items-center justify-center">
                Share
              </Text>
            </TouchableOpacity>
          </View>
          {data?.phone && (
            <View className="items-center flex-row space-x-3">
              <FontAwesome5 name="phone" size={20} color="#00BCC9" />

              <TouchableOpacity
                onPress={() => dialPhoneNumber(formatPhNumber(data?.phone))}
              >
                <Text className="text-md ">{data?.phone}</Text>
              </TouchableOpacity>
            </View>
          )}

          {data?.email && (
            <View className="items-center flex-row space-x-3">
              <FontAwesome name="envelope" size={20} color="#00BCC9" />
              <TouchableOpacity
                onPress={() => openEmail(data?.email, data?.name)}
              >
                <Text
                  className="text-md"
                  style={{ textDecorationLine: "underline" }}
                >
                  {data?.email}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {data?.address && (
            <View className="items-center flex-row space-x-3">
              <FontAwesome5 name="map" size={18} color="#00BCC9" />
              <Text className="text-md">{data?.address}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleModalVisibility}
            className=" flex-row mt-2 px-4 py-4 rounded-lg bg-[#00BCC9] items-center justify-center mb-4"
          >
            <Text className="text-1xl font-semibold uppercase tracking-wider text-white">
              Directions On Map
            </Text>
            <Animatable.View animation={"pulse"} iterationCount={"infinite"}>
              <FontAwesome
                name="location-arrow"
                size={18}
                color="white"
                className="justify-center items-center"
              />
            </Animatable.View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Map Direction Screen */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalVisibility}
      >
        <TouchableOpacity
          className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-black opacity-60"
          activeOpacity={1}
          onPress={handleModalVisibility}
        ></TouchableOpacity>

        <View className="flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]">
          <View className="bg-white rounded-2xl p-4 w-4/5 h-[500px] shadow-md">
            <View className="items-center justify-center">
              <Text className="text-[#06B2BE] text-[16px] p-1 font-bold items-center justify-center ">
                {" "}
                {data.name}
              </Text>
            </View>
            <MapView
              ref={mapViewRef}
              className="flex-1"
              initialRegion={{
                latitude: location?.latitude,
                longitude: location?.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.05,
              }}
              mapType={mapStyle}
              showsUserLocation={true}
              //followsUserLocation
            >
              {/* User's current location */}

              <Marker
                coordinate={{
                  latitude: location?.latitude,
                  longitude: location?.longitude,
                }}
                title="Your Location"
              />

              {/* Destination */}

              <Marker
                coordinate={{
                  latitude: data.latitude,
                  longitude: data.longitude,
                }}
                title={data.name}
                description={data.address}
              >
                <Image
                  source={{
                    uri: data?.photo?.images?.small?.url
                      ? data?.photo?.images?.small?.url
                      : "https://cdn.pixabay.com/photo/2015/10/30/12/22/eat-1014025_1280.jpg",
                  }}
                  className="w-12 h-12 rounded-md"
                  resizeMode="cover"
                />
              </Marker>
              <MapViewDirections
                origin={location}
                destination={`${data.latitude},${data.longitude}`}
                apikey={GOOGLE_API_KEY}
                strokeWidth={5}
                strokeColor="#06B2BE"
                onReady={(result) => fitMapToMarkers(result)}
              />
            </MapView>

            <View className="absolute top-10 left-5 ">
              <TouchableOpacity
                onPress={showSettingsPanel}
                className="bg-transparent rounded-md px-2 py-1 flex-row items-center justify-center"
              >
                <FontAwesome5 name="map" size={12} color="white" />
                <Text className="text-white text-sm font-bold ml-1">
                  Map Settings
                </Text>
              </TouchableOpacity>
            </View>

            {distance !== null && duration !== null && (
              <View className="mt-2">
                <Text className="text-[14px] font-semibold">
                  {" "}
                  Duration: {duration.toFixed(0)} minutes (
                  {distance < 1
                    ? `${(distance * 1760).toFixed(0)} yards`
                    : `${distance.toFixed(2)} miles`}
                  ){" "}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={openExternalApp}
              className="bg-[#06B2BE] rounded-md px-4 py-2 mt-2 flex-row items-center justify-center"
            >
              <FontAwesome5 name="map-marked-alt" size={24} color="white" />
              <Text className="text-white ml-2">Open in Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openInWaze}
              className="bg-[#06B2BE] rounded-md px-4 py-2 mt-2 flex-row items-center justify-center"
            >
              <FontAwesome5 name="waze" size={24} color="white" />
              <Text className="text-white ml-2">Open in Waze</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleModalVisibility}
              className="bg-[#06B2BE] opacity-50 rounded-md px-2 py-1 mt-2 flex-row items-center justify-center"
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PlaceScreen;
