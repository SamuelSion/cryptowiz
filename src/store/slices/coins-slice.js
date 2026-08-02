import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  status: "idle",
  error: null,
  searchTerm: "",
};

// Plain reducers - fetch/dispatch logic lives in CoinsService.
export const coinsSlice = createSlice({
  name: "coins",
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    startLoadingCoins(state) {
      state.status = "loading";
      state.error = null;
    },
    setCoins(state, action) {
      state.status = "succeeded";
      state.items = action.payload;
    },
    setCoinsError(state, action) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { setSearchTerm } = coinsSlice.actions;
export default coinsSlice.reducer;
