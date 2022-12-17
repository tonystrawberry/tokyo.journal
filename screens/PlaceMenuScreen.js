import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import sanityClient from "../sanity";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../components/Icon";

const PlaceMenuScreen = () => {
  const [ categories, setCategories ] = useState([]);
  const [ places, setPlaces ] = useState([]);

  const navigation = useNavigation();

  /* Fetch categories for adding filtering */
  useEffect(() => {
    sanityClient.fetch(`
        *[_type == 'category'] {
          ...
        }
      `).then((data) => {
      setCategories(data);
    });

    sanityClient.fetch(`
        *[_type == 'place'] {
          ...,
          categories[] ->
        }
      `).then((data) => {
      setPlaces(data);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View>

      </View>
      <ScrollView>
        <View className="px-4 py-2">
          <View>
            <View>
              <Text className="text-3xl font-bold">Interesting Places</Text>
            </View>
            <View className="flex-row mt-3">
              {
                categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row justify-center items-center bg-[${category.color}] p-3 rounded-lg mr-2`}
                    onPress={() => { navigation.navigate("Category", { categoryId: category._id }); }}
                  >
                    <Icon category={category} size={18} />
                    <Text className="ml-1.5 text-white font-bold">{category.title}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlaceMenuScreen;
