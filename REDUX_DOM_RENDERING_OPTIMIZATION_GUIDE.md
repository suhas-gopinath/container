# Redux DOM Rendering Optimization Guide for Module Federation

## Executive Summary

This guide explains how to modify your current Module Federation setup to properly leverage Redux for DOM rendering optimization while fixing the store duplication issue. Your project already has Redux Toolkit and React-Redux installed, but the current architecture creates multiple store instances, preventing proper state synchronization and rendering optimization.

---

## Table of Contents

1. [Current Setup Analysis](#current-setup-analysis)
2. [The Store Duplication Problem](#the-store-duplication-problem)
3. [Redux DOM Rendering Optimization Principles](#redux-dom-rendering-optimization-principles)
4. [Solution Architecture](#solution-architecture)
5. [Implementation Steps](#implementation-steps)
6. [Performance Optimization Techniques](#performance-optimization-techniques)
7. [Testing and Validation](#testing-and-validation)
8. [Best Practices](#best-practices)

---

## Current Setup Analysis

### What You Have

✅ **Dependencies Already Installed:**
- `@reduxjs/toolkit: ^2.6.0`
- `react-redux: ^9.2.0`
- `react: ^19.0.0`
- `react-dom: ^19.0.0`

✅ **Current Architecture:**
- Container MFE (Port 3003) with Redux store
- Login MFE (Port 3001) consuming container store
- Register MFE (Port 3002)
- Module Federation configured with singleton sharing

❌ **Current Issues:**
- Two Redux store instances created ("parent" and "933022122/2")
- Login MFE dispatches to wrong store instance
- State updates don't reflect in UI
- DOM rendering optimization not working due to store mismatch

---

## The Store Duplication Problem

### Root Cause

When your Login MFE imports `container/store`, Module Federation **re-executes** the store module, creating a second store instance:

```typescript
// Container creates Store #1
export const store = configureStore({ ... });

// Login MFE imports container/store
import { getDispatch } from "container/store";
// ❌ Module re-executes → Creates Store #2
```

### Why Singleton Sharing Doesn't Fix It

```javascript
shared: {
  "@reduxjs/toolkit": { singleton: true },  // ✅ Shares the library
  "react-redux": { singleton: true },       // ✅ Shares the library
}
```

**This ensures:**
- Only one copy of the **library code** is loaded

**This does NOT ensure:**
- Only one **store instance** exists
- The store module executes only once

### Impact on DOM Rendering

With two store instances:
- ❌ React-Redux Provider wraps components with Store #1
- ❌ Login MFE dispatches actions to Store #2
- ❌ Components don't re-render because they're subscribed to Store #1
- ❌ Redux's rendering optimization (shallow equality checks) doesn't work

---

## Redux DOM Rendering Optimization Principles

### How Redux Optimizes Rendering

Redux + React-Redux provides several optimization mechanisms:

#### 1. **Selective Subscriptions**

```typescript
// Only re-renders when accessToken changes
const accessToken = useSelector(state => state.auth.accessToken);
```

#### 2. **Shallow Equality Checks**

React-Redux uses `===` comparison by default:

```typescript
const user = useSelector(state => state.auth.user);
// Re-renders only if user object reference changes
```

#### 3. **Memoized Selectors**

```typescript
import { createSelector } from '@reduxjs/toolkit';

const selectUserName = createSelector(
  state => state.auth.user,
  user => user?.name  // Only recalculates if user changes
);
```

#### 4. **Batch Updates**

Redux batches multiple dispatches in event handlers:

```typescript
const handleLogin = () => {
  dispatch(setAccessToken(token));  // Batched
  dispatch(setUser(user));          // Batched
  // Only ONE re-render after both actions
};
```

### Why This Requires a Single Store

For these optimizations to work:
- ✅ All components must subscribe to the **same store instance**
- ✅ All actions must dispatch to the **same store instance**
- ✅ React-Redux Provider must wrap all components with the **same store**

---

## Solution Architecture

### Recommended Solution: Expose Store Instance via Module Federation

Instead of exposing the store module (which re-executes), expose the **store instance** and **hooks**.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Container MFE (Port 3003)                               │
│                                                         │
│  store.ts → configureStore() → Store Instance (ONCE)   │
│                    ↓                                    │
│  storeExports.ts → Exports store instance + hooks       │
│                    ↓                                    │
│  <Provider store={store}>                               │
│    <Login />  ← Login MFE loaded here                   │
│  </Provider>                                            │
└─────────────────────────────────────────────────────────┘
                         ↓
              Module Federation
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Login MFE (Port 3001)                                   │
│                                                         │
│  import { useAppDispatch, useAppSelector }              │
│         from "container/storeExports"                   │
│                    ↓                                    │
│  Uses SAME store instance (no re-execution)             │
│                    ↓                                    │
│  dispatch(setAccessToken(token)) → Updates Store #1 ✅  │
│                    ↓                                    │
│  Components re-render via Provider (Store #1) ✅        │
└─────────────────────────────────────────────────────────┘

Result: Single store instance, proper rendering optimization
```

---

## Implementation Steps

### Step 1: Refactor Container Store Exports

**Create `src/shared-auth/storeExports.ts`:**

```typescript
/**
 * Store Exports for Module Federation
 * 
 * This file exports the store instance and typed hooks.
 * Importing this file does NOT re-execute store creation.
 */

import { store } from './store';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Export the store instance directly
export { store };

// Export typed hooks for type-safe usage in MFEs
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export action creators
export { setAccessToken, clearAccessToken } from './authSlice';

// Export selectors
export { selectAccessToken } from './store';
```

**Update `src/shared-auth/store.ts`:**

```typescript
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// Create store instance ONCE
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: {
    name: 'Container Store',  // Named for Redux DevTools
    trace: true,
    traceLimit: 25,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export selectors
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
```

### Step 2: Update Container Webpack Configuration

**Update `webpack.config.js`:**

```javascript
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const deps = require("./package.json").dependencies;

module.exports = {
  // ... other config
  
  plugins: [
    new ModuleFederationPlugin({
      name: "container",
      filename: "remoteEntry.js",
      remotes: {
        login: "login@http://localhost:3001/remoteEntry.js",
        register: "register@http://localhost:3002/remoteEntry.js",
      },
      exposes: {
        // ✅ Expose store exports (not store module directly)
        "./storeExports": "./src/shared-auth/storeExports",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: deps.react,
          eager: true,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
          eager: true,
        },
        "@reduxjs/toolkit": {
          singleton: true,
          requiredVersion: deps["@reduxjs/toolkit"],
          eager: true,
        },
        "react-redux": {
          singleton: true,
          requiredVersion: deps["react-redux"],
          eager: true,
        },
      },
    }),
    // ... other plugins
  ],
};
```

### Step 3: Update Login MFE to Use Shared Store

**Update Login MFE `src/utils/submit.tsx`:**

```typescript
// ✅ Import from storeExports instead of store
import { setAccessToken, useAppDispatch } from "container/storeExports";

export const submit = async (
  username: string,
  password: string,
  setUsername: (value: string) => void,
  setPassword: (value: string) => void,
) => {
  try {
    const response = await fetch("http://localhost:90/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      const token = data.message;
      
      // ✅ Use the shared store's dispatch
      // This now dispatches to the SAME store instance as Container
      const dispatch = useAppDispatch();
      dispatch(setAccessToken(token));

      alert("Login successful! JWT Token set and it expires in 30 minutes.");
      setUsername("");
      setPassword("");
    } else {
      alert(data.message);
    }
  } catch {
    alert("Something went wrong. Please try again later.");
  }
};
```

**Alternative: Use dispatch directly in component:**

```typescript
// In Login component
import { useAppDispatch, setAccessToken } from "container/storeExports";

export const Login = () => {
  const dispatch = useAppDispatch();
  
  const handleLogin = async () => {
    // ... fetch logic
    if (response.ok) {
      dispatch(setAccessToken(token));  // ✅ Dispatches to shared store
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* ... */}
    </form>
  );
};
```

### Step 4: Update Container App.tsx (No Changes Needed)

Your current `App.tsx` already wraps with Provider correctly:

```typescript
import { Provider } from "react-redux";
import { store } from "./shared-auth/store";

const App = () => (
  <Provider store={store}>  {/* ✅ Correct */}
    <div className="app-wrapper">
      {/* ... routes */}
    </div>
  </Provider>
);
```

---

## Performance Optimization Techniques

### 1. Use Memoized Selectors with Reselect

**Create `src/shared-auth/selectors.ts`:**

```typescript
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Basic selector
export const selectAuth = (state: RootState) => state.auth;

// Memoized selector - only recalculates if auth state changes
export const selectAccessToken = createSelector(
  [selectAuth],
  (auth) => auth.accessToken
);

// Complex memoized selector example
export const selectIsAuthenticated = createSelector(
  [selectAccessToken],
  (token) => token !== null && token.length > 0
);
```

**Usage in components:**

```typescript
import { useAppSelector } from 'container/storeExports';
import { selectIsAuthenticated } from 'container/selectors';

const MyComponent = () => {
  // ✅ Only re-renders when isAuthenticated changes
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  return <div>{isAuthenticated ? 'Logged in' : 'Logged out'}</div>;
};
```

### 2. Avoid Inline Selectors

❌ **Bad - Creates new function every render:**

```typescript
const MyComponent = () => {
  // ❌ New function reference on every render
  const token = useAppSelector(state => state.auth.accessToken);
};
```

✅ **Good - Stable function reference:**

```typescript
// Define outside component or use createSelector
const selectAccessToken = (state: RootState) => state.auth.accessToken;

const MyComponent = () => {
  // ✅ Stable reference, proper optimization
  const token = useAppSelector(selectAccessToken);
};
```

### 3. Use Shallow Equality for Objects

```typescript
import { shallowEqual } from 'react-redux';

const MyComponent = () => {
  // ✅ Only re-renders if user object properties change
  const user = useAppSelector(
    state => state.auth.user,
    shallowEqual
  );
};
```

### 4. Split State into Smaller Slices

❌ **Bad - Large state object:**

```typescript
const MyComponent = () => {
  // ❌ Re-renders on ANY auth state change
  const auth = useAppSelector(state => state.auth);
  
  return <div>{auth.accessToken}</div>;
};
```

✅ **Good - Selective subscription:**

```typescript
const MyComponent = () => {
  // ✅ Only re-renders when accessToken changes
  const accessToken = useAppSelector(state => state.auth.accessToken);
  
  return <div>{accessToken}</div>;
};
```

### 5. Use React.memo for Components

```typescript
import React from 'react';
import { useAppSelector } from 'container/storeExports';

const UserDisplay = React.memo(() => {
  const user = useAppSelector(state => state.auth.user);
  
  return <div>{user?.name}</div>;
});

// Component only re-renders when Redux state changes
// Not when parent re-renders
```

### 6. Batch Multiple Dispatches

```typescript
import { batch } from 'react-redux';

const handleComplexUpdate = () => {
  batch(() => {
    dispatch(setAccessToken(token));
    dispatch(setUser(user));
    dispatch(setPreferences(prefs));
  });
  // Only ONE re-render after all three actions
};
```

### 7. Use RTK Query for API Calls (Advanced)

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:90' }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

// Automatic caching, deduplication, and optimistic updates
export const { useLoginMutation } = authApi;
```

---

## Testing and Validation

### Verify Single Store Instance

**Add console logs to verify:**

```typescript
// In container/src/shared-auth/store.ts
const storeId = Math.random().toString(36).substring(7);
console.log('🏪 Creating store instance:', storeId);

export const store = configureStore({
  reducer: { auth: authReducer },
  devTools: { name: `Container Store [${storeId}]` },
});
```

**Expected output:**
- ✅ One log message with store ID
- ✅ One store in Redux DevTools named "Container Store"

**If you see two logs:**
- ❌ Store module is still being re-executed
- Check that you're importing from `container/storeExports`, not `container/store`

### Redux DevTools Verification

1. Open Redux DevTools in browser
2. You should see **ONE store** named "Container Store"
3. Dispatch an action from Login MFE
4. Verify the action appears in Redux DevTools
5. Verify the state updates in the Container UI

### Component Re-render Testing

```typescript
import { useAppSelector } from 'container/storeExports';

const TestComponent = () => {
  const renderCount = React.useRef(0);
  renderCount.current++;
  
  const token = useAppSelector(state => state.auth.accessToken);
  
  console.log('Render count:', renderCount.current);
  
  return <div>{token}</div>;
};

// Should only increment when token changes, not on other state updates
```

---

## Best Practices

### 1. Organize Selectors

```
src/shared-auth/
  ├── store.ts           # Store configuration
  ├── storeExports.ts    # Exports for Module Federation
  ├── authSlice.ts       # Auth reducer and actions
  └── selectors.ts       # Memoized selectors
```

### 2. Type Safety

```typescript
// Always use typed hooks
import { useAppSelector, useAppDispatch } from 'container/storeExports';

// NOT the untyped versions
import { useSelector, useDispatch } from 'react-redux'; // ❌
```

### 3. Selector Naming Convention

```typescript
// Prefix selectors with 'select'
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = createSelector(...);
```

### 4. Avoid Mutating State

```typescript
// ✅ Redux Toolkit uses Immer, so this is safe:
setAccessToken: (state, action) => {
  state.accessToken = action.payload;  // ✅ Looks like mutation, but safe
}

// ❌ But don't do this outside reducers:
const state = store.getState();
state.auth.accessToken = 'new-token';  // ❌ Direct mutation
```

### 5. DevTools Configuration

```typescript
export const store = configureStore({
  reducer: { auth: authReducer },
  devTools: {
    name: 'Container Store',
    trace: true,              // Enable action stack traces
    traceLimit: 25,           // Limit trace depth
    maxAge: 50,               // Keep last 50 actions
  },
});
```

### 6. Error Handling in Async Actions

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        return rejectWithValue('Login failed');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

---

## Summary

### What Changed

1. ✅ Created `storeExports.ts` to expose store instance and hooks
2. ✅ Updated webpack config to expose `./storeExports` instead of `./store`
3. ✅ Login MFE imports from `container/storeExports`
4. ✅ Single store instance shared across all MFEs

### Benefits Achieved

1. ✅ **Single Store Instance**: No more duplicate stores
2. ✅ **Proper State Synchronization**: Actions update the correct store
3. ✅ **DOM Rendering Optimization**: Components only re-render when subscribed state changes
4. ✅ **Type Safety**: Typed hooks prevent runtime errors
5. ✅ **Performance**: Memoized selectors and selective subscriptions
6. ✅ **Debugging**: Single store in Redux DevTools

### Key Takeaways

- **Module Federation shares code, not instances** - Always expose instances, not modules that create instances
- **Redux rendering optimization requires a single store** - All components must subscribe to the same store
- **Use memoized selectors** - Prevent unnecessary recalculations
- **Subscribe selectively** - Only select the state you need
- **Use typed hooks** - Catch errors at compile time

---

## Next Steps

1. Implement the changes in your Container MFE
2. Update Login MFE to use `container/storeExports`
3. Test with Redux DevTools to verify single store
4. Measure rendering performance before/after
5. Apply the same pattern to Register MFE
6. Consider adding RTK Query for API caching

---

## References

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React-Redux Hooks API](https://react-redux.js.org/api/hooks)
- [Reselect - Memoized Selectors](https://github.com/reduxjs/reselect)
- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [Redux Performance Optimization](https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization)

---

**Generated:** 2026-03-26  
**Version:** 1.0  
**Author:** AI Coding Assistant