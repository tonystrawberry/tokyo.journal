import * as Progress from "react-native-progress";
import { Animated, Button, Modal, Platform, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import sanityClient from "../sanity";
import { UilMap, UilMapPin, UilMapPinAlt, UilNavigator, UilSurprise, UilTimes } from "@iconscout/react-native-unicons";
import PlacePin from "../components/PlacePin";
import { tomatoColor } from "../settings/colors";
import MapboxGL from "@rnmapbox/maps";
import PlaceCallout from "../components/PlaceCallout";
import createMapLink from "react-native-open-maps";

const MAX_ZOOM_LEVEL = 20;
const MIN_ZOOM_LEVEL = 1;

const QuestDirectionScreen = ({ route, navigation }) => {
  const { questId } = route.params;

  const [ quest, setQuest ] = useState(null); // Place retrieved by ID
  const [ userLocation, setUserLocation ] = useState(null);
  const [ selectedPlace, setSelectedPlace ] = useState(null); // Selected place set when clicking on a map marker -> show a callout wehn selectedPlace is set
  const [ currentDestination, setCurrentDestination ] = useState(null);
  const [ initializationModalVisible, setInitializationModalVisible ] = useState(false);
  const [ placesModalVisible, setPlacesModalVisible ] = useState(false);

  const [ questState, setQuestState ] = useState("loading");

  const [ opacity ] = useState(new Animated.Value(1));
  const [ radius ] = useState(new Animated.Value(15));

  const expandAnimation = Animated.parallel([
    Animated.timing(opacity, {
      toValue: 0.5,
      duration: 1000,
      useNativeDriver: false,
    }),
    Animated.timing(radius, {
      toValue: 15 * 2,
      duration: 1000,
      useNativeDriver: false,
    }),
  ]);

  const circleAnimation = Animated.loop(expandAnimation);

  useEffect(() => {
    circleAnimation.start();
  }, [ circleAnimation ]);

  /* Camera for MapBox */
  const camera = useRef(null);
  const [ cameraVisible, setCameraVisible ] = useState(false);

  /* Fetch the quest by ID */
  useEffect(() => {
    // 'asset ->' is needed for rendering images inside the block
    // Reference: https://www.sanity.io/help/block-content-image-materializing
    sanityClient.fetch(`
      *[_type == 'quest' && _id == '${questId}'] {
        ...,
        waypoints[] ->{
          ...,
          categories[] ->
        },
        content[]{
          ...,
          asset -> {
            ...,
            "_key": _id
          }
        },
      }[0]
    `).then((data) => {
      setQuest(data);
      setCurrentDestination(data.waypoints[ 0 ]);
    });
  }, []);

  useEffect(() => {
    if (!userLocation || !bounds) {
      return;
    }

    if (![ "loading" ].includes(questState)) {
      return;
    }

    if (inBoundingBox(
      [ bounds.minLongitude - 0.004, bounds.minLatitude - 0.004 ],
      [ bounds.maxLongitude + 0.004, bounds.maxLongitude + 0.004 ],
      [ userLocation[ 0 ], userLocation[ 1 ] ]
    )) {
      console.log("Inside the zone");
      setQuestState("inAreaPending");
      setInitializationModalVisible(true);
    } else {
      console.log("Outside the zone");
      setQuestState("notInAreaPending");
      setInitializationModalVisible(true);
    }
  }, [ userLocation, bounds ]);


  const selectBrowseArea = () => {
    setQuestState("browsing");

    setInitializationModalVisible(false);
  };

  const selectChoosePlace = () => {
    setQuestState("choosePlace");
    setInitializationModalVisible(false);
    setPlacesModalVisible(true);
  };

  const inBoundingBox = (bottomLeft, topRight, point) => {
    const isLongInRange = point[ 0 ] >= bottomLeft[ 0 ] && point[ 0 ] <= topRight[ 0 ];
    const isLatiInRange = point[ 1 ] >= bottomLeft[ 1 ] && point[ 1 ] <= topRight[ 1 ];
    return (isLongInRange && isLatiInRange);
  };


  const waypointPlaces = useMemo(() => {
    if (!quest || !quest.waypoints) {
      return [];
    }

    return quest.waypoints
      .filter((waypoint) => (waypoint._type === "place"))
      .map((waypoint) => {

        return {
          _id: waypoint._id,
          title: waypoint.title,
          description: <View className="bg-slate-100 p-2 px-3 rounded-md mt-2"><Text className="text-xs">{waypoint.shortDescription}</Text></View>,
          time: "12:00",
          lineWidth: 2,
          icon: <PlacePin category={waypoint.categories[ 0 ]} />
        };
      });
  }, [ quest ]);

  /* Memoize shape (data source) because it should only change when filteredPlaces changes */
  const walkLineShape = useMemo(() => {
    let coordinates = [];

    if (quest) {
      coordinates = quest.waypoints.map(((waypoint) => ([ waypoint.geopoint.lng, waypoint.geopoint.lat ])));
    }

    return ({
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": coordinates
      }
    });
  }, [ quest ]);

  const bounds = useMemo(() => {
    if (!quest || !quest.waypoints) {
      return {
        maxLongitude: 0,
        minLongitude: 0,
        maxLatitude: 0,
        minLatitude: 0
      };
    }

    const maxLongitude = Math.max(...quest.waypoints.map((waypoint) => (waypoint.geopoint.lng)));
    const minLongitude = Math.min(...quest.waypoints.map((waypoint) => (waypoint.geopoint.lng)));

    const maxLatitude = Math.max(...quest.waypoints.map((waypoint) => (waypoint.geopoint.lat)));
    const minLatitude = Math.min(...quest.waypoints.map((waypoint) => (waypoint.geopoint.lat)));


    return {
      maxLongitude: maxLongitude,
      minLongitude: minLongitude,
      maxLatitude: maxLatitude,
      minLatitude: minLatitude
    };
  }, [ quest ]);

  /* Memoize shape (data source) because it should only change when quest changes */
  const placesShape = useMemo(() => {
    let places = [];

    if (quest) {
      places = quest.waypoints.filter((waypoint) => (waypoint._type === "place"));
    }

    return (
      {
        "type": "FeatureCollection",
        "features": places.map((place, index) => (
          {
            "type": "Feature",
            "properties": { ...place, ...{ color: place.categories[ 0 ].color, index: index + 1 } },
            "geometry": { "type": "Point", "coordinates": [ place.geopoint.lng, place.geopoint.lat, 0.0 ] }
          }))
      }
    );
  }, [ quest ]);

  /* Memoize shape (data source) because it should only change when quest changes */
  const startEndShape = useMemo(() => {
    if (!quest) {
      return (
        {
          "type": "FeatureCollection",
          "features": []
        }
      );
    }

    const startWaypoint = quest.waypoints[ 0 ];
    const endWaypoint = quest.waypoints[ quest.waypoints.length - 1 ];

    return (
      {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": { ...startWaypoint, ...{ type: "start", icon: "pin-custom" } },
            "geometry": { "type": "Point", "coordinates": [ startWaypoint.geopoint.lng, startWaypoint.geopoint.lat, 0.0 ] }
          },
          {
            "type": "Feature",
            "properties": { ...endWaypoint, ...{ type: "end", icon: "pin-custom" } },
            "geometry": { "type": "Point", "coordinates": [ endWaypoint.geopoint.lng, endWaypoint.geopoint.lat, 0.0 ] }
          }
        ]
      }
    );
  }, [ quest ]);


  /* Listener for press event on layers */
  const onShapePress = async (e) => {

    if (questState == "choosePlace") {
      const feature = e.features[ 0 ];

      setSelectedPlace(feature.properties);
    } else {
      const feature = e.features[ 0 ];

      setSelectedPlace(feature.properties);
    }
  };

  const startFromPlace = useCallback((item) => {

  });


  useEffect(() => {
    if (!bounds || !cameraVisible) {
      return;
    }
    if (bounds && camera.current) {
      setTimeout(() => { setCameraToZone(); }, 500);
    }
  }, [ bounds, cameraVisible ]);

  const setCameraToZone = () => {
    camera.current?.fitBounds([ bounds.minLongitude, bounds.minLatitude ], [ bounds.maxLongitude, bounds.maxLatitude ], 30, 1000);
  };

  const openDirectionToStartingPoint = () => {
    createMapLink({
      provider: "google", end: `${quest.waypoints[ 0 ].geopoint.lat},${quest.waypoints[ 0 ].geopoint.lng}`
    });
  };

  return (
    quest ? (
      <View className="relative flex-1">
        <Button title="Snap To 90%" onPress={() => handleSnapPress(2)} />
        <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
        <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
        <Button title="Close" onPress={() => handleClosePress()} />
        <BottomSheet
          ref={sheetRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
        >
          <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
            {data.map(renderItem)}
          </BottomSheetScrollView>
        </BottomSheet>

        <Modal
          animationType="slide"
          transparent={true}
          visible={initializationModalVisible}>
          <View className="justify-center items-center h-full">
            <View className="bg-white rounded-lg px-4 py-4">
              <Text className="text-lg font-semibold">{
                questState == "notInAreaPending" ? "You're not in the quest zone yet." : "Let's get started"
              }</Text>
              <TouchableOpacity className="bg-green-400 p-2 rounded-lg mt-2 mb-1" onPress={openDirectionToStartingPoint}>
                <Text className="text-white font-semibold">Let's start from here</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-red-400 p-2 rounded-lg mt-2 mb-1" onPress={openDirectionToStartingPoint}>
                <Text className="text-white font-semibold">Get me to the starting point</Text>
              </TouchableOpacity>
              {
                questState == "inAreaPending" &&
                <TouchableOpacity className="bg-blue-400 p-2 rounded-lg mt-2 mb-1" onPress={selectChoosePlace}>
                  <Text className="text-white font-semibold">Let me choose where to start</Text>
                </TouchableOpacity>
              }
              <TouchableOpacity className="bg-yellow-400 p-2 rounded-lg mb-2 mt-1" onPress={selectBrowseArea}>
                <Text className="text-white font-semibold">Let me just browse the quest map</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Map showing full srcreen */}
        <TouchableWithoutFeedback className="flex-1 w-100"
          onPress={() => { setSelectedPlace(null); }}
        >
          <MapboxGL.MapView styleURL="mapbox://styles/tonystrawberry/clbgllug7000416lhf57qlzdg" style={{ flex: 1 }}>
            {selectedPlace &&
              <MapboxGL.MarkerView
                coordinate={[ selectedPlace.geopoint.lng, selectedPlace.geopoint.lat ]}
                anchor={{ x: 0.5, y: 1.65 }}
              >
                <PlaceCallout {...selectedPlace} />
              </MapboxGL.MarkerView>
            }

            <MapboxGL.UserLocation
              onUpdate={(location) => { setUserLocation([ location.coords.longitude, location.coords.latitude ]); }}
            />
            <MapboxGL.Camera
              ref={(el) => { camera.current = el; setCameraVisible(!!el); }}
              padding={1000}
              maxZoomLevel={MAX_ZOOM_LEVEL}
              minZoomLevel={MIN_ZOOM_LEVEL}
            // maxBounds={{
            //   ne: [ bounds.minLongitude - 0.002, bounds.minLatitude - 0.002 ],
            //   sw: [ bounds.maxLongitude + 0.002, bounds.maxLatitude + 0.002 ]
            // }}
            />

            {/* Start and end pins */}
            <MapboxGL.ShapeSource
              id="extremities"
              shape={startEndShape}
            >
              <MapboxGL.SymbolLayer
                id="extremitiesSymbolLayer"
                sourceID="extremities"
                style={styles.extremitiesSymbolLayer}
              />
            </MapboxGL.ShapeSource>

            {/* Place pins */}
            <MapboxGL.ShapeSource
              id="places"
              shape={placesShape}
              onPress={onShapePress}
            >
              <MapboxGL.Animated.CircleLayer
                id="placesCircleLayer"
                sourceID="places"
                style={[ styles.placesCircleLayer, { circleRadius: radius, circleOpacity: opacity } ]}
              />

              <MapboxGL.SymbolLayer
                id="placesSymbolLayer"
                sourceID="places"
                style={styles.placesSymbolLayer}
              />
            </MapboxGL.ShapeSource>

            {/* Walking line */}
            <MapboxGL.ShapeSource
              id="walk-line"
              shape={walkLineShape}
            >
              <MapboxGL.LineLayer
                id={"linelayer"}
                style={{
                  lineJoin: "bevel",
                  lineOpacity: 0.7,
                  visibility: "visible",
                  lineColor: "#22c55e",
                  lineWidth: 3,
                  lineDasharray: [ 1, 1 ],
                  lineCap: "square",
                }}
              />
            </MapboxGL.ShapeSource>
          </MapboxGL.MapView>
        </TouchableWithoutFeedback>

        <View className="absolute bottom-28 right-3 z-10">
          <TouchableOpacity className="p-2 rounded-full bg-blue-500 mb-2" onPress={() => {
            camera.current?.setCamera({
              centerCoordinate: userLocation,
              animationMode: "flyTo",
              animationDuration: 1000,

            });
          }}>
            <UilMapPin color="white" />
          </TouchableOpacity>

          <TouchableOpacity className="p-2 rounded-full bg-green-500" onPress={setCameraToZone}>
            <UilMap color="white" />
          </TouchableOpacity>
        </View>

        <SafeAreaView className="bg-white">
          <View className="flex-row px-5 py-3 items-center">

            <View className="mr-3">
              <Text className="font-light text-slate-400">
                Next place
              </Text>
              <View className="flex-row items-center">
                <Text className="font-semibold text-lg">Inoko Ramen</Text>
              </View>
            </View>

            <TouchableOpacity className={`p-2 rounded-full bg-[${tomatoColor}] ml-auto`} onPress={() => { navigation.goBack(); }}>
              <UilTimes color="white" />
            </TouchableOpacity>

            {/* <View className="mr-3 flex-1">
              <View className="flex-row items-center">
                <Text className="font-semibold text-md">You do not seem to be in the area. Please go to the starting point.</Text>
              </View>
            </View>

            <TouchableOpacity className="p-2 rounded-full bg-green-500 ml-auto" onPress={() => { openDirectionToStartingPoint(); }}>
              <UilNavigator color="white" />
            </TouchableOpacity> */}
          </View>
        </SafeAreaView >
      </View >
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
  placesCircleLayer: {
    circleColor: [ "get", "color", [ "at", 0, [ "get", "categories", [ "properties" ] ] ] ],
    circleRadius: 12
  },
  placesSymbolLayer: {
    iconImage: [ "get", "icon", [ "at", 0, [ "get", "categories", [ "properties" ] ] ] ],
    iconSize: 0.6,
    iconOpacity: 1,
    iconAllowOverlap: true,
    iconIgnorePlacement: true
  },
  extremitiesSymbolLayer: {
    iconImage: [ "get", "icon", [ "properties" ] ],
    iconColor: [ "get", "color", [ "properties" ] ],
    iconSize: 0.1,
    iconOpacity: 1,
    iconOffset: [ 0, -300 ],
    iconAllowOverlap: true,
    iconIgnorePlacement: true
  }
};


QuestDirectionScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};

export default QuestDirectionScreen;
