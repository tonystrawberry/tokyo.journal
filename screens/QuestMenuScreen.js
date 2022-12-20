import { Text, SafeAreaView, Image, View, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import sanityClient, { urlFor } from "../sanity";
import { useNavigation } from "@react-navigation/native";

const QuestMenuScreen = () => {
  const navigation = useNavigation();

  const [ quests, setQuests ] = useState([]);
  useEffect(() => {
    sanityClient.fetch(`
        *[_type == 'quest'] {
          ...
        }
      `).then((data) => {
      setQuests(data);
    });
  }, []);


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
            {quests.map((quest, index) =>
              <TouchableOpacity key={index} className="relative flex-1 rounded-lg overflow-hidden m-1"
                onPress={() => { navigation.navigate("Quest", { questId: quest._id }); }}
              >
                <Image className="w-full h-56" source={{ uri: urlFor(quest.picture).url() }} resizeMode="cover" />
                <Text className="absolute left-0 bottom-0 text-2xl font-bold text-white p-2">{quest.title}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuestMenuScreen;
