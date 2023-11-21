import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { weLoveMcr, bee } from "../assets";

const StartScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <View className="flex-1">
      {/* Background Image */}
      <ImageBackground
        source={bee}
        className="w-full h-full object-cover opacity-90"
      >
        <SafeAreaView className="flex-1 flex items-center">
          {/* Top Section*/}

          <Animatable.View animation="slideInDown" className="flex-row mt-2">
            <Text className="text-[#282828] text-3xl font-extrabold">
              Manchester
            </Text>
          </Animatable.View>

          <Animatable.View animation="slideInDown" className="flex-row">
            <Text className="text-[#282828] opacity-80 text-1xl font-semibold">
              England
            </Text>
          </Animatable.View>

          {/* Bottom Section */}

          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            className="absolute bottom-5  h-15 justify-center"
          >
            <Animatable.View
              animation={"pulse"}
              easing="ease-in-out"
              iterationCount={6}
              className=" w-72 items-center opacity-70 justify-center  bg-white rounded-lg font-bold py-1 border-b-2 "
            >
              <Text className="text-black text-[28px] text-xl font-semibold">
                Explore
              </Text>
            </Animatable.View>
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default StartScreen;
