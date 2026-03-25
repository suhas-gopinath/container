import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

/**
 * Redux Store Configuration for Module Federation
 * 
 * This store is designed to be shared across microfrontends via Module Federation.
 * It manages authentication state (JWT access token) as a singleton.
 * 
 * IMPORTANT: This store instance should be exposed via Module Federation
 * to ensure all remote apps use the same Redux store instance.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Root State Type
 * Inferred from the store itself for type safety
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * App Dispatch Type
 * Inferred from the store for typed dispatch
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Selector to get access token from Redux state
 * @param state - Root Redux state
 * @returns JWT access token or null
 */
export const selectAccessToken = (state: RootState) => state.auth.accessToken;