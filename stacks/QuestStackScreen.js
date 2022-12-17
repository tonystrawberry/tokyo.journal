import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QuestMenuScreen from "../screens/QuestMenuScreen";
import PlaceScreen from "../screens/PlaceScreen";
import PlaceCategoryScreen from "../screens/PlaceCategoryScreen";

/**
 * Stack navigator for the Home
 */
const QuestStackScreen = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName="Menu">
      <Stack.Screen name="Menu" component={QuestMenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Place" component={PlaceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Category" component={PlaceCategoryScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default QuestStackScreen;
