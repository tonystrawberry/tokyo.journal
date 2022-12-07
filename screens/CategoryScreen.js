import * as Progress from 'react-native-progress'
import React, { useEffect, useState } from 'react'
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ArrowLeftIcon } from "react-native-heroicons/solid"
import sanityClient, { urlFor } from '../sanity'

/**
 * Category screen showing the information of a certain category
 */
const CategoryScreen = ({ route, navigation }) => {
  const { categoryId } = route.params

  const [ category, setCategory ] = useState(null) // Current category retrieved via GROQ
  const [ places, setPlaces ] = useState(null) // Current places of the category retrieved via GROQ

  /* Fetch category and places */
  useEffect(() => {
    sanityClient.fetch(`
      *[_type == "category" && _id == '${categoryId}' ] {
        ...,
      }[0]
    `).then((data) => {
      setCategory(data)
    })

    sanityClient.fetch(`
      *[_type == "place" && $id in categories[]->_id] {
        ...,
      }
    `, { id: categoryId }).then((data) => {
      setPlaces(data)
    })
  }, [])

  return (
    category && places ? (
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1">
          <View className="relative">
            <TouchableOpacity onPress={navigation.goBack} className="absolute top-5 left-5 p-2 bg-white rounded-full">
              <ArrowLeftIcon size={20} color="black"></ArrowLeftIcon>
            </TouchableOpacity>
          </View>
          <View className="p-5 mt-12">
            <Text className="text-black text-3xl font-semibold">{category.title}</Text>
          </View>
          <View className="p-5 flex-row flex-wrap">
            {
              places.map((place, index) => (
                <TouchableOpacity key={index} className="relative flex-1 basis-1/2 rounded-lg overflow-hidden m-1" onPress={() => { navigation.navigate("Place", { placeId: place._id }) }}>
                  <Image className="w-full h-56" source={{ uri: urlFor(place.picture).url() }} resizeMode="cover" />
                  <Text className="absolute left-0 bottom-0 text-xl font-bold text-white p-2">{place.title}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        </ScrollView>
      </SafeAreaView>
    )
      : (
        <View className="flex-1 justify-center items-center">
          <Progress.Circle size={60} indeterminate={true} color="black" />
        </View>
      )
  )
}

export default CategoryScreen
