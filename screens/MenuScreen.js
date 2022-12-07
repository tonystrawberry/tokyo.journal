import { Text, SafeAreaView, Image, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AcademicCapIcon, CakeIcon, EnvelopeIcon, XMarkIcon } from "react-native-heroicons/solid"
import { useNavigation } from "@react-navigation/native"
import sanityClient, { urlFor } from '../sanity'

const MenuScreen = () => {
  const navigation = useNavigation()
  const [ categories, setCategories ] = useState([])

  /* Fetch categories for adding filtering */
  useEffect(() => {
    sanityClient.fetch(`
      *[_type == 'category'] {
        ...
      }
    `).then((data) => {
      setCategories(data)
    })
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center px-4 py-2 gap-2">
          <View>
            <TouchableOpacity className="bg-slate-400 p-1 rounded-full">
              <XMarkIcon color="white" size={30} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="flex-row items-center justify-center bg-orange-100 py-1 px-3 rounded-md">
            <EnvelopeIcon color={"#fb923c"} size={30} />
            <Text className="ml-1 text-orange-400 font-bold">Mail me</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-2 px-4 py-2">
          <View className="rounded-lg overflow-hidden">
            <Image source={require("../assets/avatar.png")} className="w-16 h-16 rounded-lg"></Image>
          </View>
          <View className="flex-1 bg-slate-100 p-3 rounded-lg">
            <Text className="text-slate-500 font-bold">Hi, I'm Tony! How can I help you?</Text>
          </View>
        </View>
        <View className="px-4 py-2">
          <Text className="text-lg font-bold">Interesting places</Text>
          <View className="flex-row mt-3">
            {
              categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-1 flex-row justify-center items-center bg-blue-300 p-3 rounded-lg mr-1"
                  onPress={() => { navigation.navigate("Category", { categoryId: category._id }) }}
                >
                  <AcademicCapIcon color="white" />
                  <Text className="ml-2 text-white font-bold">{category.title}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        </View>
        <View className="px-4 py-2">
          <Text className="text-lg font-bold">Quests</Text>
          <View className="flex-row mt-3">
            <TouchableOpacity className="relative flex-1 rounded-lg overflow-hidden m-1">
              <Image className="w-full h-56" source={{ uri: "https://images.unsplash.com/photo-1585574362839-63b0c1b09ad4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" }} resizeMode="cover" />
              <Text className="absolute left-0 bottom-0 text-2xl font-bold text-white p-2">Discover Harajuku</Text>
            </TouchableOpacity>
            <TouchableOpacity className="relative flex-1 rounded-lg overflow-hidden m-1">
              <Image className="w-full h-56" source={{ uri: "https://images.unsplash.com/photo-1575585091067-4f630176d6c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1618&q=80" }} resizeMode="cover" />
              <Text className="absolute left-0 bottom-0 text-2xl font-bold text-white p-2">Discover Ginza</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default MenuScreen
