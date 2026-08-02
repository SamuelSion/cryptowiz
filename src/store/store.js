import { configureStore } from "@reduxjs/toolkit";
import coinsReducer from "./slices/coins-slice";
import selectedCoinsReducer from "./slices/selected-coins-slice";
import themeReducer from "./slices/theme-slice";

export const store = configureStore({
  reducer: {
    coins: coinsReducer,
    selectedCoins: selectedCoinsReducer,
    theme: themeReducer,
  },
});

 

