// hooks/use-policy-data.ts
import { useState, useCallback, useEffect } from "react";
import {
  AppPolicy,
  ApiPolicy,
  PolicyApiResponse,
  PolicyActionStatus,
} from "@/lib/types"; 


const transformApiPolicy = (apiPolicy: ApiPolicy): AppPolicy => {
  let actionStatus: PolicyActionStatus = 'default_policy_type';

  // Determine actionStatus based on 'id' prefix or other API fields if available
  if (apiPolicy.id.startsWith('auto_')) {
    actionStatus = 'auto_policy_type';
  } else if (apiPolicy.id.startsWith('demo_')) {
    actionStatus = 'demo_policy_type';
  }

  return {
    id: apiPolicy.id,
    policyDescription: apiPolicy.name, // 'name' from API is the description
    enabled: apiPolicy.active,         // 'active' from API determines if it's enabled
    actionStatus: actionStatus,
  };
};

export function usePolicyData() {
  const [allPolicies, setAllPolicies] = useState<AppPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial load and manual refreshes
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:9926/PolicyResource");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: PolicyApiResponse = await response.json();

      if (data.status === 200 && data.policies) {
        const transformedPolicies = data.policies.map(transformApiPolicy);
        setAllPolicies(transformedPolicies);
      } else {
        throw new Error(data.message || "Invalid API response structure or error status");
      }
    } catch (e: any) {
      console.error("Failed to fetch policies:", e);
      setError(e.message || "Failed to load policy data.");
      // Optionally clear policies on error:
      // setAllPolicies([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array as setters from useState are stable

  useEffect(() => {
    // Initial fetch
    fetchPolicies();
    // Polling and pagination related logic removed
  }, [fetchPolicies]); // fetchPolicies is memoized by useCallback

  const enablePolicy = useCallback(async (policyId: string) => {
    setError(null); // Clear previous errors
    // Consider a specific loading state for the item if UI needs it,
    // otherwise, the global isLoading might be too disruptive for single item actions.
    try {
      const response = await fetch("http://localhost:9926/PolicyEnable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: policyId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to enable policy and parse error response" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // const responseData = await response.json(); // e.g. {"status": 200, "message": "Policy ... is now enabled"}
      // console.log("Enable policy response:", responseData.message);


      // Optimistically update local state after successful API call
      setAllPolicies((prevPolicies) =>
        prevPolicies.map((policy) =>
          policy.id === policyId ? { ...policy, enabled: true } : policy
        )
      );
    } catch (e: any) {
      console.error(`Failed to enable policy ${policyId}:`, e);
      setError(e.message || "Failed to enable policy.");
      // Optionally, trigger a full refresh to ensure consistency if an error occurs
      // await fetchPolicies(); 
    }
  }, [setAllPolicies, setError /* fetchPolicies if used for error recovery */]);

  const disablePolicy = useCallback(async (policyId: string) => {
    setError(null); // Clear previous errors
    try {
      const response = await fetch("http://localhost:9926/PolicyDisable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: policyId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to disable policy and parse error response" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // const responseData = await response.json();
      // console.log("Disable policy response:", responseData.message);

      // Optimistically update local state after successful API call
      setAllPolicies((prevPolicies) =>
        prevPolicies.map((policy) =>
          policy.id === policyId ? { ...policy, enabled: false } : policy
        )
      );
    } catch (e: any) {
      console.error(`Failed to disable policy ${policyId}:`, e);
      setError(e.message || "Failed to disable policy.");
      // Optionally, trigger a full refresh to ensure consistency
      // await fetchPolicies();
    }
  }, [setAllPolicies, setError /* fetchPolicies if used for error recovery */]);

  return {
    policies: allPolicies, // Return all policies directly (pagination removed)
    allPoliciesCount: allPolicies.length,
    isLoading,      // For initial load and manual full refresh
    error,
    fetchPolicies, // Expose a way to manually trigger a full refresh
    enablePolicy,
    disablePolicy,
  };
}