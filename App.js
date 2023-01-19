import React from "react";
import { getFocusedRouteNameFromRoute, NavigationContainer } from "@react-navigation/native";
import QuestStackScreen from "./stacks/QuestStackScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapStackScreen from "./stacks/MapStackScreen";
import UilBullseye from "@iconscout/react-native-unicons/icons/uil-bullseye";
import UilMapMarkerAlt from "@iconscout/react-native-unicons/icons/uil-map-marker-alt";
import UilShop from "@iconscout/react-native-unicons/icons/uil-shop";
import { store } from "./store";
import { Provider } from "react-redux";
import { tomatoColor } from "./settings/colors";
import PlaceStackScreen from "./stacks/PlaceStackScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * Entrypoint of the application
 */
export default function App() {
  /* Reference for the tabs navigator: https://reactnavigation.org/docs/bottom-tab-navigator/#tabbarlabel */
  const Tab = createBottomTabNavigator();

  const screenOptions = {
    tabBarActiveTintColor: tomatoColor,
    tabBarInactiveTintColor: "#C4C4C4",
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NavigationContainer>
          <Tab.Navigator screenOptions={screenOptions}>
            <Tab.Screen
              name="MapStack"
              component={MapStackScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <UilMapMarkerAlt color={color} size={size} />
                ),
                tabBarLabel: "Map",
                headerShown: false
              }} />

            <Tab.Screen
              name="QuestStack"
              component={QuestStackScreen}
              options={({ route }) => ({
                tabBarIcon: ({ color, size }) => (
                  <UilBullseye color={color} size={size} />
                ),
                tabBarLabel: "Quests",
                headerShown: false,
                tabBarStyle: ((route) => {
                  const routeName = getFocusedRouteNameFromRoute(route) ?? "";
                  if (routeName === "QuestDirection") {
                    return { display: "none" };
                  }
                })(route),
              })}
            />

            <Tab.Screen
              name="PlaceStack"
              component={PlaceStackScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <UilShop color={color} size={size} />
                ),
                tabBarLabel: "Places",
                headerShown: false
              }} />
          </Tab.Navigator>
        </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>
  );
}
