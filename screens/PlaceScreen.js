import * as Location from 'expo-location'
import * as Progress from 'react-native-progress'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import getDirections from "react-native-google-maps-directions"
import { ArrowLeftIcon, MapIcon } from "react-native-heroicons/solid"
import MapView, { Marker } from "react-native-maps"
import PortableText from "react-portable-text"
import CategoryTag from "../components/CategoryTag"
import PlacePin from "../components/PlacePin"
import sanityClient, { urlFor } from '../sanity'

/**
 * Place screen showing the information of a certain place
 * fetched from Sanity
 */
const PlaceScreen = ({ route, navigation }) => {
  const { placeId } = route.params

  const [ location, setLocation ] = useState(null) // User current position
  const [ place, setPlace ] = useState(null) // Place retrieved by ID

  /* Get the location of the current user */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    })()
  }, [])

  /* Fetch the place by ID */
  useEffect(() => {
    // 'asset ->' is needed for rendering images inside the block
    // Reference: https://www.sanity.io/help/block-content-image-materializing
    sanityClient.fetch(`
      *[_type == 'place' && _id == '${placeId}'] {
        ...,
        content[]{
          ...,
          asset -> {
            ...,
            "_key": _id
          }
        },
        categories[] ->
      }[0]
    `).then((data) => {
      setPlace(data)
    })
  }, [])

  /* Handler for opening Google Maps and showing the directions to the current place
     Reference: https://developers.google.com/maps/documentation/urls/get-started#directions-action
  */
  const handleGetDirections = async () => {
    const data = {
      source: { latitude: location.coords.latitude, longitude: location.coords.longitude },
      destination: { latitude: place.geopoint.lat, longitude: place.geopoint.lng },
      params: [ { key: "travelmode", value: "transit", } ]
    }

    getDirections(data)
  }

  return (
    place ? (
      <ScrollView className="bg-white">
        <View className="relative">
          <Image className="w-full h-56" source={{ uri: urlFor(place.picture).url() }} resizeMode="cover" />
          <TouchableOpacity onPress={navigation.goBack} className="absolute top-5 left-5 p-2 bg-white rounded-full">
            <ArrowLeftIcon size={20} color="black"></ArrowLeftIcon>
          </TouchableOpacity>
        </View>
        <View>
          {/* Title */}
          <View className="px-4 pt-4">
            <Text className="text-xl font-bold">{place.title}</Text>
          </View>
          {/* Details */}
          <View className="px-4 pt-4">
            <View className="flex-row text-xl font-bold">{place.categories.map((category, index) => <CategoryTag key={index} category={category} />)}</View>
          </View>
          {/* Content */}
          <View className="px-4 pt-4">
            <PortableText
              content={place.content}
            />
          </View>
          {/* Address and map */}
          <View className="flex-1">
            <View className="px-4 pt-4">
              <Text className="text-md font-bold">🏠 Address</Text>
              <Text className="mt-2">{place.address}</Text>
            </View>

            <View className="relative my-4">
              {location
                &&
                <TouchableOpacity className="flex-row items-center absolute top-3 right-3 bg-white p-2 shadow-lg z-10" onPress={handleGetDirections}>
                  <MapIcon color="blue" />
                  <Text className="font-semibold px-1">Directions</Text>
                </TouchableOpacity>
              }
              <MapView
                style={{ width: "100%", height: 200 }}
                mapType="mutedStandard"
                provider="google"
                initialRegion={{
                  latitude: place.geopoint.lat,
                  longitude: place.geopoint.lng,
                  latitudeDelta: 0.0421,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: place.geopoint.lat,
                    longitude: place.geopoint.lng
                  }}
                >
                  <PlacePin category={place.categories[ 0 ]} />
                </Marker>
              </MapView>
            </View>
          </View>

        </View>
      </ScrollView>
    ) : (
      <View className="flex-1 justify-center items-center">
        <Progress.Circle size={60} indeterminate={true} color="black" />
      </View>
    )
  )
}

export default PlaceScreen
