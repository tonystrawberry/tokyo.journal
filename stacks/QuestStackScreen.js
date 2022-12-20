import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QuestMenuScreen from "../screens/QuestMenuScreen";
import QuestScreen from "../screens/QuestScreen";

/**
 * Stack navigator for the Home
 */
const QuestStackScreen = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName="QuestMenu">
      <Stack.Screen name="QuestMenu" component={QuestMenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Quest" component={QuestScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default QuestStackScreen;
