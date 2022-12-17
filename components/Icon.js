import React from "react";
import { UilCrockery, UilMapMarkerAlt, UilUniversity } from "@iconscout/react-native-unicons";
import PropTypes from "prop-types";

const Icon = ({ category, size }) => {
  switch (category?.icon) {
    case "crockery-custom":
      return <UilCrockery color="white" size={size} />;
    case "university-custom":
      return <UilUniversity color="white" size={size} />;
    default:
      return <UilMapMarkerAlt color="white" size={size} />;
  }
};

Icon.propTypes = {
  category: PropTypes.object,
  size: PropTypes.number,
};

export default Icon;
