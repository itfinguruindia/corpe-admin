import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: (_key: string, value: string) => Promise.resolve(value),
  removeItem: () => Promise.resolve(),
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();
import AuthSlice from "./slices/authSlice";
import LayoutSlice from "./slices/layoutSlice";
import NotificationSlice from "./slices/notificationSlice";

const rootReducer = combineReducers({
  auth: AuthSlice,
  layout: LayoutSlice,
  notifications: NotificationSlice,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
