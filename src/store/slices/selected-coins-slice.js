import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "cryptowiz-selected-coins";
export const MAX_SELECTED_COINS = 5;

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeToStorage(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const initialState = {
  ids: readFromStorage(),
  pendingCoinId: null,
};

const selectedCoinsSlice = createSlice({
  name: "selectedCoins",
  initialState,
  reducers: {
    // If 5 are already selected, opens the removal dialog instead.
    toggleCoinOn(state, action) {
      const coinId = action.payload;
      if (state.ids.includes(coinId)) {
        return;
      }
      if (state.ids.length >= MAX_SELECTED_COINS) {
        state.pendingCoinId = coinId;
        return;
      }
      state.ids.push(coinId);
      writeToStorage(state.ids);
    },
    toggleCoinOff(state, action) {
      state.ids = state.ids.filter((id) => id !== action.payload);
      writeToStorage(state.ids);
    },
    // Removes one coin to make room for pendingCoinId.
    replaceCoin(state, action) {
      if (!state.pendingCoinId) {
        return;
      }
      state.ids = state.ids.filter((id) => id !== action.payload.coinIdToRemove);
      state.ids.push(state.pendingCoinId);
      state.pendingCoinId = null;
      writeToStorage(state.ids);
    },
    cancelPendingSelection(state) {
      state.pendingCoinId = null;
    },
  },
});

export const { toggleCoinOn, toggleCoinOff, replaceCoin, cancelPendingSelection } =
  selectedCoinsSlice.actions;
export default selectedCoinsSlice.reducer;
