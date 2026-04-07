import { AuthResponse } from "@/types/admin";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthResponse = {
  accessToken: "",
  admin: null,
  refreshToken: "",
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<AuthResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.admin = action.payload.admin;
      state.refreshToken = action.payload.refreshToken;
    },
    clearAuthData: (state) => {
      state.accessToken = "";
      state.admin = null;
      state.refreshToken = "";
    },
  },
});
export const { setAuthData, clearAuthData } = authSlice.actions;

export default authSlice.reducer;
