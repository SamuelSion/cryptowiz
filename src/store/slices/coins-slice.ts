import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CoinMarket } from "../../types/coin";

export interface CoinsState {
  items: CoinMarket[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  searchTerm: string;
}

const initialState: CoinsState = {
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
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    startLoadingCoins(state) {
      state.status = "loading";
      state.error = null;
    },
    setCoins(state, action: PayloadAction<CoinMarket[]>) {
      state.status = "succeeded";
      state.items = action.payload;
    },
    setCoinsError(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { setSearchTerm } = coinsSlice.actions;
export default coinsSlice.reducer;
