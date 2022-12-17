import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapScreen from "../screens/MapScreen";
import PlaceScreen from "../screens/PlaceScreen";
import PlaceCategoryScreen from "../screens/PlaceCategoryScreen";

/**
 * Stack navigator for the Map
 */
const MapStackScreen = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName="Map">
      <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Place" component={PlaceScreen} options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="Category" component={PlaceCategoryScreen} options={{ presentation: "modal", headerShown: false }} />
    </Stack.Navigator>
  );
};

export default MapStackScreen;
