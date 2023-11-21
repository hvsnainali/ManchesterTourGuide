import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const BottomBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (screenName) => {
    return route.name === screenName;
  };

  return (
    <SafeAreaView className="fixed bottom-0 left-0 right-0 flex-row justify-center h-[50px] bg-white border-t border-cyan-200 flex">
      <TouchableOpacity
        onPress={() => navigation.navigate("InfoScreen")}
        className="items-center left-48 top-4"
      >
        {isActive("InfoScreen") ? (
          <Ionicons
            name="md-information-circle-sharp"
            size={24}
            color="#00BCC9"
          />
        ) : (
          <Ionicons
            name="md-information-circle-outline"
            size={22}
            color="#00BCC9"
          />
        )}
        <Text className="text-black text-sm">Info</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        className="items-center left-4 top-4"
      >
        {isActive("Home") ? (
          <Ionicons name="home-sharp" size={24} color="#00BCC9" />
        ) : (
          <Ionicons name="home-outline" size={22} color="#00BCC9" />
        )}
        <Text className="text-black text-sm">Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Favourites")}
        className="items-center right-40 top-4"
      >
        {isActive("Favourites") ? (
          <FontAwesome name="star" size={24} color="#00BCC9" />
        ) : (
          <FontAwesome5 name="star" size={22} color="#00BCC9" />
        )}
        <Text className="text-black text-sm">Favorites</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default BottomBar;
