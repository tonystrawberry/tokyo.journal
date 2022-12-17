import { Text, SafeAreaView, Image, View, TouchableOpacity, ScrollView } from "react-native";
import React from "react";

const QuestMenuScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View>

      </View>
      <ScrollView>
        <View className="px-4 py-2">
          <View>
            <Text className="text-3xl font-bold">Exciting Quests</Text>
          </View>
          <View className="flex-row mt-3">
            <TouchableOpacity className="relative flex-1 rounded-lg overflow-hidden m-1">
              <Image className="w-full h-56" source={{ uri: "https://images.unsplash.com/photo-1585574362839-63b0c1b09ad4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" }} resizeMode="cover" />
              <Text className="absolute left-0 bottom-0 text-2xl font-bold text-white p-2">Discover Harajuku</Text>
            </TouchableOpacity>
            <TouchableOpacity className="relative flex-1 rounded-lg overflow-hidden m-1">
              <Image className="w-full h-56" source={{ uri: "https://images.unsplash.com/photo-1575585091067-4f630176d6c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1618&q=80" }} resizeMode="cover" />
              <Text className="absolute left-0 bottom-0 text-2xl font-bold text-white p-2">Discover Ginza</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuestMenuScreen;
