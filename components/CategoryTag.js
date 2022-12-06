import { useNavigation } from "@react-navigation/native"
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

/**
 * Category tag showing the icon and text
 */
const CategoryTag = ({ category }) => {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      className={`flex-row justify-center items-center bg-${category.color} py-1 px-2 mr-2 rounded-sm`}
      onPress={() => {
        navigation.goBack()
        navigation.navigate("Category", { categoryId: category._id })
      }}
    >
      <Text>{category.icon}</Text>
      <Text className="text-white ml-1">{category.title}</Text>
    </TouchableOpacity>
  )
}

export default CategoryTag
