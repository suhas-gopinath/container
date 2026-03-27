/**
 * Shared Components Barrel Export



 * Only the useMessage hook is exposed to remotes
 */

export { useApi } from "./hooks/useApi";
export type { ApiOptions } from "./hooks/useApi";

// Only export the hook - Provider and Display stay internal to container
export { useMessage } from "./contexts/MessageContext";
