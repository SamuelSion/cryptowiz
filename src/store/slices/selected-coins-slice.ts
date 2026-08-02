import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "cryptowiz-selected-coins";
export const MAX_SELECTED_COINS = 5;

interface SelectedCoinsState {
  ids: string[];
  // Coin rejected because 5 are already tracked; drives the removal dialog.
  pendingCoinId: string | null;
}

function readFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

const initialState: SelectedCoinsState = {
  ids: readFromStorage(),
  pendingCoinId: null,
};

const selectedCoinsSlice = createSlice({
  name: "selectedCoins",
  initialState,
  reducers: {
    // If 5 are already selected, opens the removal dialog instead.
    toggleCoinOn(state, action: PayloadAction<string>) {
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
    toggleCoinOff(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload);
      writeToStorage(state.ids);
    },
    // Removes one coin to make room for pendingCoinId.
    replaceCoin(state, action: PayloadAction<{ coinIdToRemove: string }>) {
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
