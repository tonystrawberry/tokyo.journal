import * as Progress from "react-native-progress";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import sanityClient from "../sanity";
import { UilMap, UilMapPin, UilMapPinAlt, UilTimes } from "@iconscout/react-native-unicons";
import PlacePin from "../components/PlacePin";
import { tomatoColor } from "../settings/colors";
import MapboxGL from "@rnmapbox/maps";
import PlaceCallout from "../components/PlaceCallout";

const QuestDirectionScreen = ({ route, navigation }) => {
  const { questId } = route.params;

  const [ quest, setQuest ] = useState(null); // Place retrieved by ID
  const [ userLocation, setUserLocation ] = useState(null);
  const [ selectedPlace, setSelectedPlace ] = useState(null); // Selected place set when clicking on a map marker -> show a callout wehn selectedPlace is set

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
    });

  }, []);

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

    console.log("places", places);

    return (
      {
        "type": "FeatureCollection",
        "features": places.map((place, index) => (
          {
            "type": "Feature",
            "properties": { ...place, ...{ color: place.categories[ 0 ].color, index: index } },
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
            "properties": { ...startWaypoint, ...{ type: "start", icon: "map-marker-start-custom" } },
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
    const feature = e.features[ 0 ];

    setSelectedPlace(feature.properties);
  };


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

  return (
    quest ? (
      <View className="relative flex-1">
        {/* Map showing full srcreen */}
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
            <MapboxGL.CircleLayer
              id="placesCircleLayer"
              sourceID="places"
              style={styles.placesCircleLayer}
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

        <View className="absolute bottom-28 right-3 z-10">
          <TouchableOpacity className="p-2 rounded-full bg-blue-500 mb-2" onPress={() => {
            camera.current?.setCamera({
              centerCoordinate: userLocation,
              animationMode: "flyTo",
              animationDuration: 1000
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
    iconSize: 1,
    iconOpacity: 1,
    iconOffset: [ 0, -10 ],
    iconAllowOverlap: true,
    iconIgnorePlacement: true
  }
};


QuestDirectionScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};

export default QuestDirectionScreen;
