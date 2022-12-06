import React from 'react'
import { Text, View } from 'react-native'
import { MapPinIcon } from "react-native-heroicons/solid"

/**
 * Pin on the map
 */
const PlacePin = ({ category }) => {
  const color = category.color
  const icon = category.icon

  // Do not delete the colors below (these are needed to enable dynamic styling with TailwindCSS)
  // bg-red-400
  // bg-blue-500

  return (
    category ?
      (<View className={`p-2 rounded-full bg-${color}`}>
        <Text>{icon}</Text>
      </View>
      )
      :
      (<View className={`p-2 rounded-full bg-slate-500`}>
        <MapPinIcon color="white" />
      </View>)
  )
}

export default PlacePin
