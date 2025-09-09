import { View, Text, Image, TextInput } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";


interface Props {
  onPress: () => void;
  placeholder: string;
}

const SearchBar = ({ onPress, placeholder }: Props) => {
  return (
    <View className="flex-row items-center bg-dark-200 px-4 py-4">
      <Image
        source={icons.search}
        className="size-5 resizeMode='contain' tintColor='#868080ff'"
      />
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value=""
        onChangeText={() => {}}
        placeholderTextColor={"#aaa1a1ff"}
        className="flex-1 ml-2 text-white"
      />

    </View>
  );
};

export default SearchBar;
