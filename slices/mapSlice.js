import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  calloutPlaceId: null
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    showCalloutPlaceId: (state, action) => {
      state.calloutPlaceId = action.payload;
    }
  },
});

export const { showCalloutPlaceId } = mapSlice.actions;

export default mapSlice.reducer;
