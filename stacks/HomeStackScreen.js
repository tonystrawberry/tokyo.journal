import React from 'react'
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import MenuScreen from "../screens/MenuScreen"
import PlaceScreen from "../screens/PlaceScreen"
import CategoryScreen from "../screens/CategoryScreen"

/**
 * Stack navigator for the Home
 */
const HomeStackScreen = () => {
  const Stack = createNativeStackNavigator()

  return (
    <Stack.Navigator initialRouteName="Menu">
      <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Place" component={PlaceScreen} options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="Category" component={CategoryScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default HomeStackScreen
