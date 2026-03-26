
## Objective


**Scope**: This prompt covers ONLY the container MFE changes. Remote MFE integration will be handled separately.

---

## Current State Analysis

### Existing File Location

- **Current Path**: `src/hooks/useApi.ts`
- **Current Usage**: Used internally in `src/components/Verify.tsx`
- **Dependencies**: React hooks (`useState`)

### Current Implementation

```typescript
// src/hooks/useApi.ts
import { useState } from "react";

interface ApiOptions {
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  credentials: RequestCredentials;
}

export const useApi = (
  path: string,
  onSuccess: (message: string) => void,
  onError: (message: string) => void,
  options?: ApiOptions,
) => {
  const BASE_URL = "http://localhost:90/users";
  const [isLoading, setIsLoading] = useState(false);

  const callApi = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}${path}`, options);
      const data: { message: string } = await response.json();

      if (!response.ok) {
        onError(data.message);
        return;
      }
      onSuccess(data.message);
    } catch (error: unknown) {
      onError("Service is down. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return { callApi, isLoading };
};
```

---

## Required Changes

### Step 1: Create Shared Components Folder Structure

**Action**: Create the following folder structure in the container MFE:

```
container/
├── src/
│   ├── shared-components/
│   │   ├── hooks/
│   │   │   └── useApi.ts
│   │   └── index.ts
```

**Deliverables**:

1. Create folder: `src/shared-components/`
2. Create subfolder: `src/shared-components/hooks/`
3. Move `src/hooks/useApi.ts` to `src/shared-components/hooks/useApi.ts`
4. Create barrel export file: `src/shared-components/index.ts`

---

### Step 2: Create Barrel Export File

**File**: `src/shared-components/index.ts`

**Content**:

```typescript
/**
 * Shared Components Barrel Export

 *
 * that are exposed via Module Federation to remote MFEs.
 */

export { useApi } from "./hooks/useApi";
export type { ApiOptions } from "./hooks/useApi";
**Requirements**:

- Export the `useApi` hook
- Export the `ApiOptions` interface as a type export
- Add JSDoc comments explaining the purpose

---

### Step 3: Update useApi.ts to Export Types

**File**: `src/shared-components/hooks/useApi.ts`

**Required Changes**:

1. Ensure `ApiOptions` interface is exported:

   ```typescript
   export interface ApiOptions {
     method: "GET" | "POST";
     headers?: Record<string, string>;
     body?: string;
     credentials: RequestCredentials;
   }
   ```

2. Keep the rest of the implementation identical to the current version

**Full Updated Content**:

```typescript
import { useState } from "react";

export interface ApiOptions {
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  credentials: RequestCredentials;
}

export const useApi = (
  path: string,
  onSuccess: (message: string) => void,
  onError: (message: string) => void,
  options?: ApiOptions,
) => {
  const BASE_URL = "http://localhost:90/users";
  const [isLoading, setIsLoading] = useState(false);

  const callApi = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}${path}`, options);
      const data: { message: string } = await response.json();

      if (!response.ok) {
        onError(data.message);
        return;
      }
      onSuccess(data.message);
    } catch (error: unknown) {
      onError("Service is down. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return { callApi, isLoading };
};
```

---

### Step 4: Update webpack.config.js to Expose Shared Components

**File**: `webpack.config.js`

**Current exposes section**:

```javascript
exposes: {},
```

**Updated exposes section**:

```javascript
exposes: {
  "./useApi": "./src/shared-components/hooks/useApi",
},
```

**Full ModuleFederationPlugin Configuration**:

```javascript
new ModuleFederationPlugin({
  name: "container",
  filename: "remoteEntry.js",
  remotes: {
    login: "login@http://localhost:3001/remoteEntry.js",
    register: "register@http://localhost:3002/remoteEntry.js",
  },
  exposes: {
    "./useApi": "./src/shared-components/hooks/useApi",
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
  },
}),
```

**Critical Requirements**:

- The exposed path MUST be `"./useApi"` (this is what remotes will import)
- The module path MUST be `"./src/shared-components/hooks/useApi"` (without `.ts` extension)
- Do NOT modify the `shared` configuration
- Do NOT modify the `remotes` configuration

---

### Step 5: Update Container's Verify.tsx Import

**File**: `src/components/Verify.tsx`

**Current import** (line 2):

```typescript
import { useApi } from "../hooks/useApi";
```

**Updated import**:

```typescript
import { useApi } from "../shared-components/hooks/useApi";
```

**Alternative (using barrel export)**:

```typescript
import { useApi } from "../shared-components";
```

**Requirement**: Use the direct path import (`"../shared-components/hooks/useApi"`) for clarity.

---

### Step 6: Delete Old Hook File and Unit Tests

**Action**: Delete the following files:

2. `src/hooks/useApi.test.ts` (if exists - unit tests)


- Ensure no other files in the container MFE import from `src/hooks/useApi.ts`

---


### Container MFE Validation
- [ ] File `src/shared-components/hooks/useApi.ts` exists
- [ ] File `src/shared-components/index.ts` exists and exports `useApi`
- [ ] `ApiOptions` interface is exported in `useApi.ts`
- ❌ Create multiple copies of the hook
- ❌ Use `useCallback` (it was intentionally removed)
- ❌ Add new unit tests
- ❌ Modify existing unit tests

### DO:

- ✅ Move the file to the new location
- ✅ Export the `ApiOptions` interface
- ✅ Update webpack config to expose the hook

- ✅ Update import paths in existing container files
- ✅ Delete the old hook file after verification
- ✅ Delete old unit test files (useApi.test.ts)
- ✅ Ensure TypeScript types are properly exported

- ✅ Test thoroughly in container MFE only

1. **Reusability**: Remote MFEs can use the same hook without duplicating code
1. **Consistency**: All MFEs use the same API calling logic
1. **Maintainability**: Single source of truth for API calls in container
1. **Module Federation**: Enables sharing of common utilities across MFEsect
1. Verify all loading states work correctly
1. Verify success and error messages display properly
1. Check browser console for any errors
1. Verify no TypeScript compilation errors
**Note**: Remote MFE testing will be covered in a separate prompt.

---

3. Restart the TypeScript server in VS Code
4. Clear build cache and rebuild: `rm -rf dist && npm run build`

### Issue: TypeScript errors about missing types

**Solution**:

1. Ensure `ApiOptions` interface is exported in `useApi.ts`
2. Verify barrel export includes type export: `export type { ApiOptions }`
3. Restart TypeScript server in VS Code

### Issue: Webpack build fails after exposing useApi

**Solution**:

1. Verify the exposed path in webpack config: `"./useApi": "./src/shared-components/hooks/useApi"`
2. Ensure the path does NOT include `.ts` exten## Success Criteria

✅ **Refactor is complete when**:

1. Container MFE builds successfully without errors
2. Container MFE runs successfully on port 3000
5. No TypeScript errors in container MFE
6. No console errors in browser when testing Verify page
7. Old `src/hooks/useApi.ts` file is deleted
8. Old `src/hooks/useApi.test.ts` file is deleted (if exists)
10. Code review confirms no breaking changes to container functionalitye)
11. Old `src/hooks/useApi.ts` file is deleted
12. Code review confirms no breaking changes

---

## File Checklist


---

## Additional Notes

### Why Move to Shared Components?

1. **Reusability**: Remote MFEs can use the same hook without duplicating code
2. **Consistency**: All MFEs use the same API calling logic
3. **Maintainability**: Single source of truth for API calls
4. **JWT Management**: Centralized token handling across all MFEs
2. JWT is read from `sessionStorage` on every call (always fresh)
3. Simpler architecture without Redux overhead
4. Avoids store duplication issues in Module Federation

### Security Considerations


## End of Prompt

This prompt provides complete, unambiguous instructions for refactoring the `useApi` hook to shared components in the container MFE and exposing it via Module Federation. Follow each step sequentially and verify at each checkpoint.

**Important**: This prompt covers ONLY container MFE changes. Remote MFE integration (login, register) will be handled in a separate prompt.
