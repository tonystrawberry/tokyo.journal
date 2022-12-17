import * as Progress from "react-native-progress";
import React, { useEffect, useState } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import sanityClient, { urlFor } from "../sanity";
import { UilArrowLeft } from "@iconscout/react-native-unicons";
import PropTypes from "prop-types";
import PlacePin from "../components/PlacePin";

/**
 * Category screen showing the information of a certain category
 */

const PlaceCategoryScreen = ({ route, navigation }) => {
  const { categoryId } = route.params;

  const [ category, setCategory ] = useState(null); // Current category retrieved via GROQ
  const [ places, setPlaces ] = useState(null); // Current places of the category retrieved via GROQ

  /* Fetch category and places */
  useEffect(() => {
    sanityClient.fetch(`
      *[_type == "category" && _id == '${categoryId}' ] {
        ...,
      }[0]
    `).then((data) => {
      setCategory(data);
    });

    sanityClient.fetch(`
      *[_type == "place" && $id in categories[]->_id] {
        ...,
      }
    `, { id: categoryId }).then((data) => {
      setPlaces(data);
    });
  }, []);

  return (
    category && places ? (

      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-4 py-2">
          <View className="flex-row relative justify-center items-center">
            <TouchableOpacity onPress={navigation.goBack} className="absolute top-0 left-0">
              <UilArrowLeft size={40} color={category.color} />
            </TouchableOpacity>
            <View className="ml-2">
              <PlacePin category={category} size={18} />
            </View>
            <Text className="text-black text-3xl font-semibold ml-2">{category.title}</Text>
          </View>
          <View className="flex-row flex-wrap my-4">
            {
              places.map((place, index) => (
                <TouchableOpacity key={index} className="relative flex-1 basis-1/2 rounded-lg overflow-hidden m-1" onPress={() => { navigation.navigate("Place", { placeId: place._id }); }}>
                  <Image className="w-full h-56" source={{ uri: urlFor(place.picture).url() }} resizeMode="cover" />
                  <Text className="absolute left-0 bottom-0 text-xl font-bold text-white p-2">{place.title}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        </ScrollView>
      </SafeAreaView>
    )
      : (
        <View className="flex-1 justify-center items-center">
          <Progress.Circle size={60} indeterminate={true} color="black" />
        </View>
      )
  );
};

PlaceCategoryScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};


export default PlaceCategoryScreen;
