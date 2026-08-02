 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "cryptowiz-theme";
 

function readInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  const prefersLight = _optionalChain([window, 'access', _ => _.matchMedia, 'optionalCall', _2 => _2("(prefers-color-scheme: light)"), 'access', _3 => _3.matches]);
  return prefersLight ? "light" : "dark";
}

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: readInitialTheme() },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, state.mode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
