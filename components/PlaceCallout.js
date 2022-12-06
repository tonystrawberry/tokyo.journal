import { useNavigation } from "@react-navigation/native"
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { ArrowRightCircleIcon } from "react-native-heroicons/solid"
import { Callout } from 'react-native-maps'
import { urlFor } from "../sanity"

/**
 * Callout (bubble) that is shown when clicking on a pin on the map
 */
const PlaceCallout = (place) => {
  const navigation = useNavigation()

  return (
    <Callout
      tooltip
      onPress={() => { navigation.navigate("Place", { placeId: place._id }) }}
      style={{ width: 250 }}
    >
      <TouchableOpacity className="rounded-lg bg-white flex-row justify-center overflow-hidden">
        <Image style={{ height: 50, width: 50 }} source={{ uri: urlFor(place.picture).url() }} resizeMode="cover" />
        <View className="flex-1 flex justify-center align-center px-2">
          <Text className="text-center text-gray-500 uppercase font-bold">{place.title}</Text>
        </View>
        <View className="flex justify-center align-center pr-2">
          <ArrowRightCircleIcon color="black" />
        </View>
      </TouchableOpacity>
    </Callout>
  )
}

export default PlaceCallout
