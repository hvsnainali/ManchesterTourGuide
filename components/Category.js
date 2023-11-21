import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

const Category = ({ title, imageSrc, staticImageSrc, type, setType }) => {
  const [playAnimation, setPlayAnimation] = useState(false);

  const handlePress = () => {
    setType(title.toLowerCase());
  };

  useEffect(() => {
    if (type === title.toLowerCase()) {
      setPlayAnimation(true);
      setTimeout(() => {
        setPlayAnimation(false);
      }, 1700); // Adjust the timeout duration according to your GIF's length
    }
  }, [type]);

  return (
    <TouchableOpacity
      className="items-center justify-center space-y-2"
      onPress={handlePress}
    >
      <View
        className={`w-24 h-24 p-1 rounded items-center justify-center ${
          type === title.toLowerCase() ? "bg-gray-50  " : ""
        }`}
      >
        <Image
          source={playAnimation ? imageSrc : staticImageSrc}
          style={{ width: "100%", height: "100%" }}
          contentFit="fill"
        />
      </View>
      <Text className="text-[#00BCC9] text-xl font-semibold">
        {title?.length > 13 ? `${title.slice(0, 13)}.. ` : title}
      </Text>
    </TouchableOpacity>
  );
};

export default Category;
