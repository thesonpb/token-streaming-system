// src/types/history.ts (or wherever you keep your types)
export interface HistoryLogItem {
  timestamp: string;
  type: string;
  token: string;
  reason: string;
  by: string;
  details: string;
  id: string;
}

export interface HistoryApiResponse {
  status: number;
  data: HistoryLogItem[];
}

/**
 * Represents the structure of a single token object
 * as received from the /AdminUsers API endpoint.
 */
export interface ApiUserToken {
  username: string;
  token: string;        
  status: string;      
  access_count_1m: number;
  access_count_5m: number; 
  access_count_15m: number;
  concurrent_users: number;
}

/**
 * Represents the overall structure of the JSON response
 * from the /AdminUsers API endpoint.
 */
export interface AdminUsersApiResponse {
  status: number; 
  tokens: ApiUserToken[];
}

/**
 * Represents the structure of a user object as used
 * within the frontend application (e.g., in the Zustand store or component state).
 * This is often a transformed version of the API data.
 */
export interface AppUser {
  id: string;          
  username: string;   
  apiStatus: string;  
  concurrents: number; 
  hits1m: number;      
  hits5m: number;      
  hits15m: number;     
  // banned: boolean;     
}

// In your types file (e.g., @/lib/types.ts)

// Raw policy data from the API
export interface ApiPolicy {
  id: string;                   // e.g., "bf260296-0183-4d67-98ca-302b7892c861"
  name: string;                 // e.g., "Auto ban token when concurrent are over 1 in a 1 minute window"
  active: boolean;              // e.g., false. This will map to the "Enabled" checkbox.
  max_concurrent: number;       // e.g., 1
  auto_ban_enabled: boolean;    // e.g., false. Could be used for more detailed logic if needed.
  geo_ban_enabled: boolean;     // e.g., false
  created_at: string;           // e.g., "2025-05-14T09:07:59.954Z"
  updated_at: string;           // e.g., "2025-05-14T09:07:59.954Z"
}

export type PolicyActionStatus = 'auto_policy_type' | 'demo_policy_type' | 'default_policy_type';

export interface AppPolicy {
  id: string;
  policyDescription: string; // From ApiPolicy.name
  enabled: boolean;          // From ApiPolicy.active (for the checkbox)
  actionStatus: PolicyActionStatus; // Derived for icon selection
}

// API response structure for fetching policies
export interface PolicyApiResponse {
  status: number;
  message?: string; // Optional message field
  policies?: ApiPolicy[]; // Array of policy objects
}
