import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import Icon from "./Icon";

/**
 * Category tag showing the icon and text
 */
const CategoryTag = ({ category }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      className={`flex-row justify-center items-center bg-[${category.color}] py-1 px-2 mr-2 rounded-sm`}
      onPress={() => {
        navigation.goBack();
        navigation.navigate("Category", { categoryId: category._id });
      }}
    >
      <Icon category={category} size={12} />
      <Text className="text-white ml-1 font-semibold">{category.title}</Text>
    </TouchableOpacity>
  );
};

CategoryTag.propTypes = {
  category: PropTypes.object,
};

export default CategoryTag;
