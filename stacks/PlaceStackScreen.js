import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PlaceScreen from "../screens/PlaceScreen";
import PlaceCategoryScreen from "../screens/PlaceCategoryScreen";
import PlaceMenuScreen from "../screens/PlaceMenuScreen";

/**
 * Stack navigator for the Home
 */
const PlaceStackScreen = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName="PlaceMenu">
      <Stack.Screen name="PlaceMenu" component={PlaceMenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Place" component={PlaceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Category" component={PlaceCategoryScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default PlaceStackScreen;
