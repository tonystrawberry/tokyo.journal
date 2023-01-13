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
      {
        place.index != null &&
        <View className="border px-1 rounded-sm justify-center items-center ml-2">
          <Text className="font-bold text-md">{place.index}</Text>
        </View>
      }
      <Text className="font-semibold ml-1">{place.title}</Text>
      <View className="ml-2">
        <UilArrowRight color="black" />
      </View>
    </TouchableOpacity>
  );
};

export default PlaceCallout;
