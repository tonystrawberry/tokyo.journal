import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, TouchableWithoutFeedback, View, LogBox } from "react-native";
import Autocomplete from "react-native-autocomplete-input";
import PlaceCallout from "../components/PlaceCallout";
import PlacePin from "../components/PlacePin";
import sanityClient from "../sanity";
import MapboxGL from "@rnmapbox/maps";
import { UilSearch } from "@iconscout/react-native-unicons";
import { tomatoColor } from "../settings/colors";
import { MAPBOX_SECRET_TOKEN } from "@env";

LogBox.ignoreLogs([ "[MarkerView]" ]);

MapboxGL.setAccessToken(MAPBOX_SECRET_TOKEN);

const MAX_BOUNDS = { ne: [ 138.4983174359129, 34.531641940574325 ], sw: [ 141.01054553647947, 36.90017022929824 ] };
const CENTER_COORDINATE = [ 139.7673393767293, 35.681881089686655 ];
const MAX_ZOOM_LEVEL = 20;
const MIN_ZOOM_LEVEL = 8;

/**
 * Home screen showing the map of Tokyo with all the points of interests
 * fetched from Sanity
 */
const MapScreen = () => {
  const [ places, setPlaces ] = useState([]); // Places retrieved via GROQ
  const [ filteredPlaces, setFilteredPlaces ] = useState([]); // Filtered places by search input or categories filter
  const [ categories, setCategories ] = useState([]); // Categories retrieved via GROQ
  const [ search, setSearch ] = useState(""); // Search input
  const [ searchResults, setSearchResults ] = useState([]); // Search results shown in the autocomplete list
  const [ showResults, setShowResults ] = useState(false); // Show the results on the autocomplete list
  const [ showCategoryFilters, setShowCategoryFilters ] = useState(false); // Show the category filters
  const [ selectedCategory, setSelectedCategory ] = useState(null); // Selected category in the filter list
  const [ selectedPlace, setSelectedPlace ] = useState(null); // Selected place set when clicking on a map marker -> show a callout wehn selectedPlace is set

  /* Camera for MapBox */
  const camera = useRef(null);
  const shapeSource = useRef(null);

  /* Fetch places to display on the map and categories for adding filtering */
  /* Initialize the camera */
  useEffect(() => {
    sanityClient.fetch(`
      *[_type == 'place'] {
        _id,
        title,
        geopoint,
        picture,
        categories[] ->
      }
    `).then((data) => {
      setPlaces(data);
      setFilteredPlaces(data);
    });

    sanityClient.fetch(`
      *[_type == 'category'] {
        ...
      }
    `).then((data) => {
      setCategories(data);
    });

    camera.current?.setCamera({
      centerCoordinate: CENTER_COORDINATE,
      maxBounds: [ [ 138.4983174359129, 34.531641940574325 ], [ 141.01054553647947, 36.90017022929824 ] ]
    });
  }, []);

  /* Reset filtered places everytime 'selectedCategory' changes */
  useEffect(() => {
    if (selectedCategory) {
      const filteredPlaces = places.filter((place) => (place.categories.map(category => category._id).includes(selectedCategory._id)));
      setFilteredPlaces(filteredPlaces);
    } else {
      setFilteredPlaces(places);
    }
  }, [ selectedCategory ]);

  /* Reset search results displayed on the autocomplete input whenever 'search' or 'selectedCategory' changes */
  useEffect(() => {
    const data = places.filter((place) => (place.title.includes(search) && (!selectedCategory || place.categories.map(category => category._id).includes(selectedCategory._id))));
    setSearchResults(data);
  }, [ search, selectedCategory ]);

  /* Memoize shape (data source) because it should only change when filteredPlaces changes */
  const shape = useMemo(() => (
    {
      "type": "FeatureCollection",
      "features": filteredPlaces.map((filteredPlace) => (
        {
          "type": "Feature",
          "properties": { ...filteredPlace, ...{ color: filteredPlace.categories[ 0 ].color } },
          "geometry": { "type": "Point", "coordinates": [ filteredPlace.geopoint.lng, filteredPlace.geopoint.lat, 0.0 ] }
        }))
    }
  ), [ filteredPlaces ]);

  /* Methods */

  /* Recenter the map to the selected place when selecting it from the autocomplete */
  const recenterToPlace = (place) => {
    setSelectedPlace(place);

    camera.current?.setCamera({
      centerCoordinate: [ place.geopoint.lng, place.geopoint.lat ],
      zoomLevel: 16,
      animationMode: "flyTo",
      animationDuration: 2000
    });
  };

  /* Listener for press event on layers */
  const onShapePress = async (e) => {
    const feature = e.features[ 0 ];

    if (feature.properties.cluster_id) {
      const zoom = await shapeSource.current?.getClusterExpansionZoom(feature);

      camera.current?.setCamera({
        centerCoordinate: feature.geometry.coordinates,
        zoomLevel: zoom,
        animationMode: "flyTo",
        animationDuration: 1000
      });
    } else if (feature.properties._id) {
      setSelectedPlace(feature.properties);
    }
  };

  return (
    <View className="relative flex-1">
      {/* Autocomplete search bar and filters */}
      <SafeAreaView className="absolute flex-row z-10">
        <View className="relative flex-row flex-1 ml-4">
          <Autocomplete
            data={searchResults}
            hideResults={!showResults}
            containerStyle={{ width: "100%" }}
            inputContainerStyle={{ borderWidth: 0 }}
            listContainerStyle={{
              overflow: "hidden",
              backgroundColor: "white",
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              paddingBottom: searchResults.length > 0 ? 6 : 0
            }}
            className={`bg-white h-12 px-4 shadow-lg pl-12 font-bold ${showResults && searchResults.length > 0 ? "rounded-t-3xl" : "rounded-full"}`}
            placeholder="Search"
            onChangeText={setSearch}
            value={search}
            onFocus={() => { setShowResults(true); }}
            flatListProps={{
              keyExtractor: (_, idx) => idx,
              renderItem: ({ item }) => {
                return (
                  <TouchableOpacity
                    className={"flex-row items-center py-0.5 px-2 rounded-b-3xl"}
                    onPress={() => {
                      setShowResults(false);
                      setSearch(item.title);
                      recenterToPlace(item);
                    }}
                  >
                    <View className="mr-2">
                      <PlacePin category={item.categories[ 0 ]} small />
                    </View>
                    <Text numberOfLines={1} className="flex-1 font-semibold">{item.title}</Text>
                  </TouchableOpacity>
                );
              }
            }}
          />
          <View className={`top-2 left-2 h-8 w-8 absolute justify-center items-center rounded-full bg-[${tomatoColor}]
           z-10`}>
            <UilSearch color="white" size={20} />
          </View>
        </View>

        {/* Filters by category */}
        <View className="relative ml-2 mr-4">
          {
            selectedCategory ?
              <TouchableOpacity className={"p-2 rounded-full"} onPress={() => { setShowCategoryFilters(!showCategoryFilters); }}>
                <PlacePin category={selectedCategory} />
              </TouchableOpacity>
              :
              <TouchableOpacity className={`p-2 rounded-full bg-[${tomatoColor}]`} onPress={() => { setShowCategoryFilters(!showCategoryFilters); }}>
                <PlacePin />
              </TouchableOpacity>
          }

          {
            showCategoryFilters &&
            <View className="absolute items-center top-12 bg-white rounded-3xl p-1 shadow-lg" style={{ width: 46, left: "50%", marginLeft: -23 }}>
              <TouchableOpacity className="my-1" onPress={() => {
                console.log("SET SELECTED CATEGORY to null");
                setSelectedCategory(null);
              }}>
                <PlacePin />
              </TouchableOpacity>
              {
                categories.map((category, index) => (
                  <TouchableOpacity key={index} className="my-1" onPress={() => {
                    console.log("SET SELECTED CATEGORY", category);
                    setSelectedCategory(category);
                  }}>
                    <PlacePin category={category} />
                  </TouchableOpacity>
                ))
              }
            </View>
          }
        </View>
      </SafeAreaView>

      {/* Map showing full srcreen */}
      <TouchableWithoutFeedback className="flex-1 w-100"
        onPress={() => { setSelectedPlace(null); }}
      >
        <MapboxGL.MapView style={{ flex: 1 }}>
          {selectedPlace &&
            <MapboxGL.MarkerView
              coordinate={[ selectedPlace.geopoint.lng, selectedPlace.geopoint.lat ]}
              anchor={{ x: 0.5, y: 1.65 }}
            >
              <PlaceCallout {...selectedPlace} />
            </MapboxGL.MarkerView>
          }
          <MapboxGL.UserLocation />
          <MapboxGL.Camera
            ref={camera}
            maxZoomLevel={MAX_ZOOM_LEVEL}
            minZoomLevel={MIN_ZOOM_LEVEL}
            maxBounds={MAX_BOUNDS}
          />
          <MapboxGL.ShapeSource
            ref={shapeSource}
            id="earthquakes"
            shape={shape}
            cluster={true}
            clusterMaxZoomLevel={14}
            clusterRadius={50}
            onPress={onShapePress}
          >
            <MapboxGL.CircleLayer
              id="clusters"
              sourceID="earthquakes"
              filter={[ "has", "point_count" ]}
              style={styles.clustersCircleLayer}
            />

            <MapboxGL.SymbolLayer
              id="clusterCount"
              sourceID="earthquakes"
              filter={[ "has", "point_count" ]}
              style={styles.clusterCountSymbolLayer}
            />

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

            <MapboxGL.SymbolLayer
              id="unclusteredSymbol"
              sourceID="earthquakes"
              filter={[ "!", [ "has", "point_count" ] ]}
              style={styles.unclusteredPointSymbolLayer}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </TouchableWithoutFeedback>
    </View >
  );
};

// Styles for Mapbox layers
// General Reference: https://github.com/rnmapbox/maps
// Reference for the expressions inside textField, circleColor, iconImage: https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/
const styles = {
  clustersCircleLayer: {
    circleStrokeColor: "#d18e92",
    circleStrokeWidth: 3,
    circleStrokeOpacity: 1,
    circleColor: tomatoColor,
    circleRadius: 20,
  },
  clusterCountSymbolLayer: {
    textField: [ "get", "point_count_abbreviated" ],
    textFont: [ "DIN Offc Pro Medium", "Arial Unicode MS Bold" ],
    textSize: 16,
    textColor: "white"
  },
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

export default MapScreen;
