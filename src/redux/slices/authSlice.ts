import { AuthResponse } from "@/types/admin";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthResponse = {
  accessToken: "",
  admin: null,
  refreshToken: "",
  profilePictureUrl: null,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<AuthResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.admin = action.payload.admin;
      state.refreshToken = action.payload.refreshToken;
      if (action.payload.profilePictureUrl !== undefined) {
        state.profilePictureUrl = action.payload.profilePictureUrl;
      }
    },
    setProfilePictureUrl: (state, action: PayloadAction<string | null>) => {
      state.profilePictureUrl = action.payload;
    },
    clearAuthData: (state) => {
      state.accessToken = "";
      state.admin = null;
      state.refreshToken = "";
      state.profilePictureUrl = null;
    },
  },
});
export const { setAuthData, setProfilePictureUrl, clearAuthData } =
  authSlice.actions;

export default authSlice.reducer;
