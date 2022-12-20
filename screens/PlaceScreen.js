import * as Location from "expo-location";
import * as Progress from "react-native-progress";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PortableText from "react-portable-text";
import CategoryTag from "../components/CategoryTag";
import sanityClient, { urlFor } from "../sanity";
import { UilArrowLeft, UilHome, UilThumbsUp } from "@iconscout/react-native-unicons";
import PropTypes from "prop-types";
import PlacePin from "../components/PlacePin";
import MapboxGL from "@rnmapbox/maps";

/**
 * Place screen showing the information of a certain place
 * fetched from Sanity
 */
const PlaceScreen = ({ route, navigation }) => {
  const { placeId } = route.params;

  const [ place, setPlace ] = useState(null); // Place retrieved by ID

  /* Camera for MapBox */
  const camera = useRef(null);

  /* Get the location of the current user */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      // const location = await Location.getCurrentPositionAsync({});
      // setLocation(location);
    })();
  }, []);

  /* Fetch the place by ID */
  useEffect(() => {
    // 'asset ->' is needed for rendering images inside the block
    // Reference: https://www.sanity.io/help/block-content-image-materializing
    sanityClient.fetch(`
      *[_type == 'place' && _id == '${placeId}'] {
        ...,
        content[]{
          ...,
          asset -> {
            ...,
            "_key": _id
          }
        },
        categories[] ->
      }[0]
    `).then((data) => {
      setPlace(data);
    });
  }, []);

  /* Memoize shape (data source) because it should only change when filteredPlaces changes */
  const shape = useMemo(() => {
    let features = [];

    if (place) {
      features = [
        {
          "type": "Feature",
          "properties": { ...place },
          "geometry": { "type": "Point", "coordinates": [ place.geopoint.lng, place.geopoint.lat, 0.0 ] }
        }
      ];
    }

    return {
      "type": "FeatureCollection",
      "features": features
    };
  }, [ place ]);


  /* Handler for opening Google Maps and showing the directions to the current place
     Reference: https://developers.google.com/maps/documentation/urls/get-started#directions-action
  */
  // const handleGetDirections = async () => {
  //   const data = {
  //     source: { latitude: location.coords.latitude, longitude: location.coords.longitude },
  //     destination: { latitude: place.geopoint.lat, longitude: place.geopoint.lng },
  //     params: [ { key: "travelmode", value: "transit", } ]
  //   };

  //   // getDirections(data)
  // };

  return (
    place ? (
      <ScrollView className="bg-white">
        <View>
          <Image className="w-full h-56" source={{ uri: urlFor(place.picture).url() }} resizeMode="cover" />
          <TouchableOpacity onPress={navigation.goBack} className="absolute top-5 left-5 p-1 bg-white rounded-full">
            <UilArrowLeft size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View>
          {/* Title */}
          <View className="flex-row items-center px-4 pt-4">
            <PlacePin category={place.categories[ 0 ]} />
            <Text className="text-xl font-semibold ml-2">{place.title}</Text>
          </View>
          {/* Details */}
          <View className="px-4 pt-4">
            <View className="flex-row text-xl font-bold">{place.categories.map((category, index) => <CategoryTag key={index} category={category} />)}</View>
          </View>
          {/* Content */}
          {
            place.content &&
            <View className="px-4 pt-4">
              <View className="flex-row items-center">
                <View className={"mr-1 rounded-full bg-white"}>
                  <UilThumbsUp color={place.categories[ 0 ].color} size={20} />
                </View>
                <Text className="text-md font-semibold">Description</Text>
              </View>
              <View className="mt-2">
                <PortableText
                  content={place.content}
                />
              </View>
            </View>
          }
          {/* Address and map */}
          <View>
            <View className="px-4 pt-4">
              <View className="flex-row items-center">
                <View className={"mr-1 rounded-full bg-white"}>
                  <UilHome color={place.categories[ 0 ].color} size={20} />
                </View>
                <Text className="text-md font-semibold">Address</Text>
              </View>
              <Text className="mt-2">{place.address}</Text>
            </View>
          </View>

          <View className="my-4 h-60">
            <MapboxGL.MapView styleURL="mapbox://styles/tonystrawberry/clbgllug7000416lhf57qlzdg" style={{ flex: 1 }}>
              <MapboxGL.UserLocation />
              <MapboxGL.Camera
                ref={camera}
                zoomLevel={14}
                centerCoordinate={[ place.geopoint.lng, place.geopoint.lat ]}
                animationMode="none"
                animationDuration={1}
              />
              <MapboxGL.ShapeSource
                id="earthquakes"
                shape={shape}
              >
                <MapboxGL.CircleLayer
                  id="unclusteredCircle"
                  sourceID="earthquakes"
                  filter={[ "!", [ "has", "point_count" ] ]}
                  style={styles.unclusteredPointCircleLayer}
                />

                <MapboxGL.SymbolLayer
                  id="unclusteredSymbol"
                  sourceID="earthquakes"
                  filter={[ "!", [ "has", "point_count" ] ]}
                  style={styles.unclusteredPointSymbolLayer}
                />
              </MapboxGL.ShapeSource>
            </MapboxGL.MapView>
          </View>
        </View >
      </ScrollView >
    ) : (
      <View className="flex-1 justify-center items-center">
        <Progress.Circle size={60} indeterminate={true} color="black" />
      </View>
    )
  );
};

// Styles for Mapbox layers
// General Reference: https://github.com/rnmapbox/maps
// Reference for the expressions inside textField, circleColor, iconImage: https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/
const styles = {
  unclusteredPointCircleLayer: {
    circleColor: [ "get", "color", [ "at", 0, [ "get", "categories", [ "properties" ] ] ] ],
    circleRadius: 16
  },
  unclusteredPointSymbolLayer: {
    iconImage: [ "get", "icon", [ "at", 0, [ "get", "categories", [ "properties" ] ] ] ],
    iconSize: 0.8,
    iconOpacity: 1,
    iconAllowOverlap: true,
    iconIgnorePlacement: true
  }
};

PlaceScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};

export default PlaceScreen;
