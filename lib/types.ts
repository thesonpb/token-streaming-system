// lib/types.ts

/**
 * Represents the structure of a single token object
 * as received from the /AdminUsers API endpoint.
 */
export interface ApiUserToken {
  username: string;
  token: string;         // This is the unique identifier for the user/token entry
  status: string;        // e.g., "ok"
  access_count_1m: number;
  access_count_3m: number; // Included as it's in your API response
  access_count_5m: number;
}

/**
 * Represents the overall structure of the JSON response
 * from the /AdminUsers API endpoint.
 */
export interface AdminUsersApiResponse {
  status: number; // The status code within the API response body (e.g., 200)
  tokens: ApiUserToken[];
}

/**
 * Represents the structure of a user object as used
 * within the frontend application (e.g., in the Zustand store or component state).
 * This is often a transformed version of the API data.
 */
export interface AppUser {
  id: string;          // Unique identifier, typically mapped from ApiUserToken.token
  username: string;    // Mapped from ApiUserToken.username
  apiStatus: string;   // The 'status' field from the API (e.g., "ok")
  concurrents: number; // UI-specific or simulated data, initialized if not from API
  hits1m: number;      // Mapped from ApiUserToken.access_count_1m
  hits5m: number;      // Mapped from ApiUserToken.access_count_5m
  hits15m: number;     // UI-specific or simulated, initialized if not from this API
  // banned: boolean;     // Managed by the frontend or another API
}