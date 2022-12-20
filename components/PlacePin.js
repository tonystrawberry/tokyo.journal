import React from "react";
import { View } from "react-native";

import { UilMapPinAlt } from "@iconscout/react-native-unicons";
import { tomatoColor } from "../settings/colors";
import PropTypes from "prop-types";
import Icon from "./Icon";

/**
 * Pin on the map
 */
const PlacePin = ({ category, small }) => {
  const color = category ? category.color : tomatoColor;
  const size = small ? 12 : 18;
  const icon = <Icon category={category} size={size} />;


  // Do not delete the colors below (these are needed to enable dynamic styling with TailwindCSS)
  // bg-[#C95D63]
  // bg-[#EE8434]
  // bg-[#AE8799]
  // bg-[#717EC3]
  // bg-[#496DDB]
  // bg-[#88A47C]

  return (
    category ?
      (
        <View className={`p-1.5 rounded-full bg-[${color}]`}>
          {icon}
        </View>
      )
      :
      (<View className={`p-1.5 rounded-full bg-[${color}]`}>
        <UilMapPinAlt color="white" size={size} />
      </View>)
  );
};

PlacePin.propTypes = {
  category: PropTypes.object,
  small: PropTypes.bool,
};

export default PlacePin;
