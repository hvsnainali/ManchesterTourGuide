//importing modules and components that are needed
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home";
import StartScreen from "./screens/StartScreen";
import PlaceScreen from "./screens/PlaceScreen";
import ExploreScreen from "./screens/ExploreScreen";
import { useState } from "react";
import Favourites from "./screens/Favourites";
import InfoScreen from "./screens/InfoScreen";
import ExpPlace from "./screens/ExpPlace";

//creating stack navigator
const Stack = createNativeStackNavigator();

//defining the main app.js
export default function app() {
  return (
    //navigation container setup with all the stack.screens
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="StartScreen" component={StartScreen} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="PlaceScreen" component={PlaceScreen} />
        <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
        <Stack.Screen name="ExpPlace" component={ExpPlace} />
        <Stack.Screen name="InfoScreen" component={InfoScreen} />
        <Stack.Screen name="Favourites" component={Favourites} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}