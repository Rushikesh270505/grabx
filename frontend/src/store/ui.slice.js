import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    showAuth: false
  },
  reducers: {
    openAuth: state => {
      state.showAuth = true;
    },
    closeAuth: state => {
      state.showAuth = false;
    }
  }
});

export const { openAuth, closeAuth } = uiSlice.actions;
export default uiSlice.reducer;

