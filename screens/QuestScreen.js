import * as Progress from "react-native-progress";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import sanityClient, { urlFor } from "../sanity";
import { UilArrowLeft } from "@iconscout/react-native-unicons";
import PortableText from "react-portable-text";
import MapboxGL from "@rnmapbox/maps";
import PlacePin from "../components/PlacePin";
import Timeline from "../components/Timeline";

const QuestScreen = ({ route, navigation }) => {
  const { questId } = route.params;

  const [ quest, setQuest ] = useState(null); // Place retrieved by ID

  /* Camera for MapBox */
  const camera = useRef(null);

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
      .filter((waypoint) => (waypoint !== null))
      .map((waypoint) => {

        return {
          _id: waypoint._id,
          title: waypoint.title,
          description: <View className="bg-slate-100 p-2 px-3 rounded-md mt-2"><Text className="text-xs">{waypoint.shortDescription}</Text></View>,
          time: "12:00",
          lineWidth: 2,
          icon: <PlacePin category={waypoint.categories[ 0 ]}
          />
        };
      });
  }, [ quest ]);

  const navigateToPlace = useCallback((item) => {
    navigation.navigate("Place", { placeId: item._id });
  });

  return (
    quest ? (
      <ScrollView className="bg-white">
        <View>
          <Image className="w-full h-56" source={{ uri: urlFor(quest.picture).url() }} resizeMode="cover" />
          <TouchableOpacity onPress={navigation.goBack} className="absolute top-5 left-5 p-1 bg-white rounded-full">
            <UilArrowLeft size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View>
          {/* Title */}
          <View className="flex-row items-center px-4 pt-4">
            <Text className="text-xl font-semibold">{quest.title}</Text>
          </View>
          {/* Content */}
          {
            quest.content &&
            <View className="px-4 pt-4">
              <View className="flex-row items-center">
                <Text className="text-md font-semibold">Description</Text>
              </View>
              <View className="mt-2">
                <PortableText
                  content={quest.content}
                />
              </View>
            </View>
          }
          {/* Places */}
          <View className="px-4 pt-4">
            <View className="flex-row items-center">
              <Text className="text-md font-semibold">Checkpoints</Text>
            </View>
            <View className="mt-2">
              <Timeline
                style={{ paddingTop: 15, paddingBottom: 15 }}
                data={waypointPlaces}
                innerCircle="element"
                circleColor="rgba(0,0,0,0)"
                lineColor="#e2e8f0"
                showTime={false}
                detailContainerStyle={{ marginBottom: 30 }}
                isUsingFlatlist={false}
                options={{
                  style: { paddingTop: 15, paddingBottom: 15 }
                }}
                onEventPress={navigateToPlace}
              />
            </View>
          </View>
          {/* Map */}
          <View className="my-4 h-60">
            <MapboxGL.MapView styleURL="mapbox://styles/tonystrawberry/clbgllug7000416lhf57qlzdg" style={{ flex: 1 }}>
              <MapboxGL.UserLocation />
              <MapboxGL.Camera
                ref={camera}
                zoomLevel={14}
                animationMode="none"
                animationDuration={1}
              />
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

QuestScreen.propTypes = {
  route: PropTypes.object,
  navigation: PropTypes.object,
};

export default QuestScreen;
