import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../components/BottomBar";
import {
  weLoveMcr,
  street,
  mcrTram,
  bee,
  land,
  mcrChina,
  chris,
  alam,
  sky,
  bridge,
  build,
  salford,
  utd,
  mig,
  stories,
  attract,
  uni,
  joe,
  lucas,
  cafee,
  canal,
  view,
  mahr,
} from "../assets";
import { FontAwesome5 } from "@expo/vector-icons";

const InfoScreen = () => {
  const navigation = useNavigation();
  const images = [
    weLoveMcr,
    street,
    mcrTram,
    bee,
    land,
    chris,
    mcrChina,
    alam,
    sky,
    bridge,
    build,
    salford,
    utd,
    mig,
    stories,
    attract,
    uni,
    joe,
    lucas,
    cafee,
    canal,
    view,
    mahr,
  ];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const emergencyCall = async (number) => {
    const url = `tel:${number}`;
    if (await Linking.canOpenURL(url)) {
      Linking.openURL(url);
    } else {
      alert("Cannot place the call at this moment");
    }
  };
  const formatPhNumber = (number) => {
    return number.replace(/\D+/g, "");
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold m-4">Discover Manchester</Text>
      <View className="flex-1 m-1 bg-cyan-100">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <Text className="mx-4 my-2 text-xl font-bold">Introduction</Text>
          <Text className="mx-4 mb-4">
            Manchester is a bustling and cosmopolitan city in the northwest of
            England. It has a rich history and a diversified culture as the
            centre of the Industrial Age. Manchester is well-known for its
            academic excellence, football, and music. It also has something for
            everyone. Discover famous sites including the Manchester Cathedral,
            the Museum of Science and Industry, and Old Trafford Stadium, which
            acts as the home of the Manchester United football team. You'll
            learn about some of the city's most interesting locations and tales
            in this tour.
          </Text>

          {/* Manchester's Worker Bee Symbol */}
          <Text className="mx-4 my-2 text-xl font-bold">
            Manchester's Worker Bee Symbol
          </Text>
          <Image
            source={bee}
            className="w-40 h-40 mx-4 borderRadius:10 shadow-black rounded"
          />
          <Text className="mx-4 mb-4 mt-2">
            The worker bee is one of Manchester's most well-known images, and
            you can find it all over the city. It shows that the city has always
            been busy and that its people have a strong work ethic. During the
            Industrial Revolution, the bee became Manchester's sign to show that
            the city is a hub of activity and new ideas. Today, the worker bee
            is still a proud symbol of the city and its strong character.
          </Text>

          {/* Salford */}
          <Text className="mx-4 my-2 text-xl font-bold">Salford</Text>
          <Image
            source={salford}
            className="w-40 h-40 mx-4 borderRadius:10 shadow-black rounded"
          />
          <Text className="mx-4 mb-4 mt-2">
            Salford is a city and borough that is within striking distance of
            Manchester. It has a lot of history, and its textile factories and
            workshops were essential to the Industrial Revolution. Today,
            Salford is going through a rapid process of regeneration that is
            making it a more modern, lively place. It is home to MediaCityUK,
            which is a centre for creative and digital businesses. The BBC and
            ITV have their headquarters there. Salford Quays used to be a busy
            port area, but now it's a famous place for shopping, eating, and
            hanging out. The Lowry, a well-known arts centre, and the Imperial
            War Museum North, both of offering unique culture experiences, are
            located in the area.
          </Text>

          {/* Canal Street */}
          <Text className="mx-4 my-2 text-xl font-bold">Canal Street</Text>
          <Image
            source={canal}
            className="w-40 h-40 mx-4 borderRadius:10 shadow-black rounded"
          />
          <Text className="mx-4 mb-4 mt-2">
            Canal Street serves as where Manchester's LGBTQ+ scene is most
            prevalent. This busy street is in the middle of the city and runs
            along the beautiful Rochdale Canal. It has a wide range of bars,
            clubs, restaurants, and shops. Canal Street is a must-see spot for
            both locals and tourists because of how friendly it is and how
            numerous enjoyable activities occur there. The area is especially
            recognised for the yearly Manchester Pride festival, which honours
            the culture and history of LGBTQ+ people and brings people from all
            over the world.
          </Text>

          {/* Horizontal ScrollView of Images */}
          <View>
            <Text className="m-4 font-extrabold">Manchester Images:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="m-1"
            >
              {images.map((image, index) => (
                <TouchableOpacity key={index} onPress={() => openModal(image)}>
                  <Image
                    source={image}
                    className="w-40 h-80 mr-5 borderRadius:10 shadow-black rounded"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Emergency Contact Details */}
          <View className="m-4 bg-rose-200 rounded-lg">
            <Text className="text-xl font-bold mb-2 ">Emergency Contacts:</Text>
            <FontAwesome5 name="phone" size={20} color="black" />
            <Text className="font-bold uppercase mt-2">Police:</Text>
            <TouchableOpacity onPress={() => emergencyCall("999")}>
              <Text>Emergency: 999</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => emergencyCall("101")}>
              <Text>Non-emergency: 101</Text>
            </TouchableOpacity>

            <Text className="font-bold mt-2 uppercase">Ambulance:</Text>
            <TouchableOpacity onPress={() => emergencyCall("999")}>
              <Text>Emergency: 999</Text>
            </TouchableOpacity>

            <Text className="font-bold mt-2 uppercase">Fire Service:</Text>
            <TouchableOpacity onPress={() => emergencyCall("999")}>
              <Text>Emergency: 999</Text>
            </TouchableOpacity>

            <Text className="font-bold mt-2 uppercase">NHS:</Text>
            <TouchableOpacity onPress={() => emergencyCall("111")}>
              <Text>Non-emergency medical help: 111</Text>
            </TouchableOpacity>

            <Text className="font-bold mt-2 uppercase">
              Tourist Information:
            </Text>
            <TouchableOpacity
              onPress={() =>
                emergencyCall(formatPhNumber("+44 (0)161 234 3157"))
              }
            >
              <Text>+44 (0)161 234 3157</Text>
            </TouchableOpacity>

            <Text className="font-bold mt-2 mb-1 uppercase">Transport:</Text>
            <TouchableOpacity
              onPress={() =>
                emergencyCall(formatPhNumber("+44 (0)161 205 2000"))
              }
            >
              <Text>Metrolink (Tram) Enquiries: +44 (0)161 205 2000</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                emergencyCall(formatPhNumber(" +44 (0)871 200 2233"))
              }
            >
              <Text>Bus Enquiries: +44 (0)871 200 2233</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                emergencyCall(formatPhNumber("+44 (0)345 748 4950"))
              }
            >
              <Text>Train Enquiries: +44 (0)345 748 4950</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Modal slide in, for each Image for better View*/}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-transparent bg-opacity-50">
          <View className="w-1/2 h-1/2 bg-white rounded shadow-lg">
            <TouchableOpacity
              className="absolute top-4 right-4 z-10"
              onPress={closeModal}
            >
              <Text className="text-2xl font-bold text-white">×</Text>
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={selectedImage}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </View>
        </View>
      </Modal>

      <BottomBar />
    </SafeAreaView>
  );
};

export default InfoScreen;
