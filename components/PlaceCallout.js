import { UilArrowRight } from "@iconscout/react-native-unicons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

/**
 * Callout (bubble) that is shown when clicking on a pin on the map
 */
const PlaceCallout = (place) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity className="flex-row rounded-lg shadow-lg bg-white justify-center items-center p-1" onPress={() => { navigation.navigate("Place", { placeId: place._id }); }}>
      <Text className="text-center font-semibold ml-2">{place.title}</Text>
      <View className="ml-2">
        <UilArrowRight color="black" />
      </View>
    </TouchableOpacity>
  );
};

export default PlaceCallout;
