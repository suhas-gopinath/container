import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Authentication State Interface
 * Stores JWT access token in Redux (NOT in localStorage/sessionStorage)
 */
interface AuthState {
  accessToken: string | null;
}

/**
 * Initial authentication state
 * Access token starts as null until obtained from v2 APIs
 */
const initialState: AuthState = {
  accessToken: null,
};

/**
 * Authentication Slice
 * Manages JWT access token state for Module Federation sharing
 * 
 * Actions:
 * - setAccessToken: Store new JWT token (from /refresh or /verify/v2)
 * - clearAccessToken: Remove token (on /logout)
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set JWT access token in Redux state
     * @param state - Current auth state
     * @param action - Payload containing the JWT token
     */
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    /**
     * Clear JWT access token from Redux state
     * Called on logout to clean up authentication state
     * @param state - Current auth state
     */
    clearAccessToken: (state) => {
      state.accessToken = null;
    },
  },
});

// Export actions for use in components
export const { setAccessToken, clearAccessToken } = authSlice.actions;

// Export reducer for store configuration
export default authSlice.reducer;

// Export type for use in selectors
export type { AuthState };