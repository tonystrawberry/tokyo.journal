import React, { useEffect, useState } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import Autocomplete from "react-native-autocomplete-input"
import { MapPinIcon } from "react-native-heroicons/solid"
import MapView, { Marker } from 'react-native-maps'
import PlaceCallout from "../components/PlaceCallout"
import PlacePin from "../components/PlacePin"
import sanityClient from '../sanity'

/**
 * Home screen showing the map of Tokyo with all the points of interests
 * fetched from Sanity
 */
const MapScreen = () => {
  const [ places, setPlaces ] = useState([]) // Places retrieved via GROQ
  const [ filteredPlaces, setFilteredPlaces ] = useState([]) // Filtered places by search input or categories filter
  const [ categories, setCategories ] = useState([]) // Categories retrieved via GROQ
  const [ search, setSearch ] = useState("") // Search input
  const [ searchResults, setSearchResults ] = useState([]) // Search results shown in the autocomplete list
  const [ mapRef, setMapRef ] = useState(null) // Reference to the MapView component
  const [ markerRefs, setMarkerRefs ] = useState([]) // All references to the Market component
  const [ showResults, setShowResults ] = useState(false) // Show the results on the autocomplete list
  const [ showCategoryFilters, setShowCategoryFilters ] = useState(false) // Show the category filters
  const [ selectedCategory, setSelectedCategory ] = useState(null) // Selected category in the filter list

  /* Fetch places to display on the map */
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
      setPlaces(data)
      setFilteredPlaces(data)
    })
  }, [])

  /* Fetch categories for adding filtering */
  useEffect(() => {
    sanityClient.fetch(`
      *[_type == 'category'] {
        ...
      }
    `).then((data) => {
      setCategories(data)
    })
  }, [])

  /* Reset filtered places everytime 'selectedCategory' changes */
  useEffect(() => {
    if (selectedCategory) {
      const filteredPlaces = places.filter((place) => (place.categories.map(category => category._id).includes(selectedCategory._id)))
      setFilteredPlaces(filteredPlaces)
    } else {
      setFilteredPlaces(places)
    }
  }, [ selectedCategory ])

  /* Reset search results displayed on the autocomplete input whenever 'search' or 'selectedCategory' changes */
  useEffect(() => {
    const data = places.filter((place) => (place.title.includes(search) && (!selectedCategory || place.categories.map(category => category._id).includes(selectedCategory._id))))
    setSearchResults(data)
  }, [ search, selectedCategory ])

  /* Set the map boundaries to allow user to only see Tokyo
     Called when the MapView is loaded
  */
  const setBounding = () => {
    /* Reference: https://github.com/react-native-maps/react-native-maps/blob/master/docs/mapview.md */
    mapRef.setMapBoundaries({
      latitude: 35.79419667198104,
      longitude: 139.88609881769287,
    }, {
      latitude: 35.334771198243494,
      longitude: 139.43697432977862,
    },
    )
  }

  /* Set the visible area to the selected place */
  const recenterToPlace = (place) => {
    /* Reference: https://github.com/react-native-maps/react-native-maps/blob/master/docs/mapview.md */
    mapRef.animateToRegion({
      latitude: place.geopoint.lat,
      longitude: place.geopoint.lng,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1
    })
  }

  return (
    <View className="relative">
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

            }}
            className={`bg-white h-12 px-4 shadow-lg pl-12 font-bold ${showResults && searchResults.length > 0 ? "rounded-t-3xl" : "rounded-full"}`}
            placeholder="ALL"
            onChangeText={setSearch}
            value={search}
            onFocus={() => { setShowResults(true) }}
            flatListProps={{
              keyExtractor: (_, idx) => idx,
              renderItem: ({ item }) => (
                <TouchableOpacity
                  className={`bg-white h-12 w-60 px-4 justify-center pl-14 rounded-b-3xl`}
                  onPress={() => {
                    setShowResults(false)
                    recenterToPlace(item)
                  }}
                >
                  <View className={`top-2 left-2 absolute justify-center items-center rounded-full z-10`}>
                    <PlacePin category={item.categories[ 0 ]} />
                  </View>
                  <Text className="text-gray-500 uppercase font-bold">{item.title}</Text>
                </TouchableOpacity>
              )
            }}
          />
          <View className={`top-2 left-2 h-8 w-8 absolute justify-center items-center rounded-full bg-slate-500 z-10`}>
            <MapPinIcon color="white" size={20} />
          </View>
        </View>

        <View className="relative ml-2 mr-4">
          {
            selectedCategory ?
              <TouchableOpacity className={`p-2 rounded-full`} onPress={() => { setShowCategoryFilters(!showCategoryFilters) }}>
                <PlacePin category={selectedCategory} />
              </TouchableOpacity>
              :
              <TouchableOpacity className={`p-2 rounded-full bg-slate-500`} onPress={() => { setShowCategoryFilters(!showCategoryFilters) }}>
                <MapPinIcon color="white" />
              </TouchableOpacity>
          }


          {
            showCategoryFilters &&
            <View className="absolute items-center top-12 bg-white rounded-3xl p-2" style={{ width: 60, left: "50%", marginLeft: -30 }}>
              <TouchableOpacity className="my-1 w-10 p-2 rounded-full bg-slate-500" onPress={() => setSelectedCategory(null)}>
                <MapPinIcon color="white" />
              </TouchableOpacity>
              {
                categories.map((category, index) => (
                  <TouchableOpacity key={index} className="my-1 w-10" onPress={() => {
                    setSelectedCategory(category)
                    markerRefs.forEach((markerRef) => { markerRef && markerRef.hideCallout() })
                  }}>
                    <PlacePin category={category} />
                  </TouchableOpacity>
                ))
              }
            </View>
          }
        </View>
      </SafeAreaView>

      {/* Map showing full screen */}
      <MapView
        ref={(ref) => setMapRef(ref)}
        provider="google"
        style={{ width: "100%", height: "100%" }}
        maxZoomLevel={20}
        minZoomLevel={8}
        rotateEnabled={false}
        showsUserLocation={true}
        showsBuildings={false}
        showsPointsOfInterest={false}
        calloutOffset={{ x: 0, y: 100 }}
        initialRegion={{
          latitude: 35.681881089686655,
          longitude: 139.7673393767293,
          latitudeDelta: 0.1922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={[
          {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [
              {
                visibility: "off"
              }
            ]
          },
          {
            featureType: "poi",
            stylers: [
              {
                visibility: "off"
              }
            ]
          },
          {
            featureType: "road",
            elementType: "labels.icon",
            stylers: [
              {
                visibility: "off"
              }
            ]
          }
        ]}
        onMapReady={() => {
          setBounding()
        }}
      >
        {
          filteredPlaces.map((place, index) => (
            <Marker
              key={index}
              ref={(ref) => {
                markerRefs[ index ] = ref
                setMarkerRefs(markerRefs)
              }}
              coordinate={{
                latitude: place.geopoint.lat,
                longitude: place.geopoint.lng
              }}
              calloutOffset={{ x: 0, y: -0.25 }}
              calloutAnchor={{ x: 0, y: -0.25 }}
            >
              <PlacePin category={place.categories[ 0 ]} />

              <PlaceCallout {...place} />
            </Marker>
          ))
        }
      </MapView>
    </View>
  )
}

export default MapScreen
