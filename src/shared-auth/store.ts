import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const selectAccessToken = (state: RootState) => state.auth.accessToken;

export const getDispatch = () => store.dispatch;

export { setAccessToken } from "./authSlice";
