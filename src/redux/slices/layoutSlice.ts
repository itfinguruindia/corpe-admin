import { createSlice } from "@reduxjs/toolkit";

interface LayoutState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
}

const initialState: LayoutState = {
  isCollapsed: false,
  isMobileOpen: false,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isCollapsed = !state.isCollapsed;
    },
    setSidebarCollapsed(state, action: { payload: boolean }) {
      state.isCollapsed = action.payload;
    },
    toggleMobileSidebar(state) {
      state.isMobileOpen = !state.isMobileOpen;
    },
    openMobileSidebar(state) {
      state.isMobileOpen = true;
    },
    closeMobileSidebar(state) {
      state.isMobileOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase("persist/REHYDRATE", (state, action: any) => {
      const incoming = action.payload?.layout;
      if (incoming) {
        state.isCollapsed = incoming.isCollapsed ?? false;
      }
      // Always start with mobile sidebar closed
      state.isMobileOpen = false;
    });
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  openMobileSidebar,
  closeMobileSidebar,
} = layoutSlice.actions;

export default layoutSlice.reducer;
