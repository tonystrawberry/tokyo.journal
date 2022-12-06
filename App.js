import { NavigationContainer } from "@react-navigation/native"
import HomeStackScreen from "./stacks/HomeStackScreen"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MapStackScreen from "./stacks/MapStackScreen"
import { HomeIcon, MapIcon } from "react-native-heroicons/solid"

/**
 * Entrypoint of the application
 */
export default function App() {
  /* Reference for the tabs navigator: https://reactnavigation.org/docs/bottom-tab-navigator/#tabbarlabel */
  const Tab = createBottomTabNavigator()

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="HomeStack"
            component={HomeStackScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <HomeIcon color={color} size={size} />
              ),
              tabBarLabel: "HOME",
              headerShown: false
            }} />
          <Tab.Screen
            name="MapStack"
            component={MapStackScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MapIcon color={color} size={size} />
              ),
              tabBarLabel: "MAP",
              headerShown: false
            }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>

  )
}
