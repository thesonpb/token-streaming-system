// hooks/use-policy-data.ts
import { useState, useCallback, useEffect, useRef } from "react";
import {
  AppPolicy,
  ApiPolicy,
  PolicyApiResponse,
  PolicyActionStatus,
} from "@/lib/types"; // Adjust this path to where your types are defined

const ITEMS_PER_PAGE = 10; // Define items per page, can be made dynamic

// Helper to transform API data to AppPolicy
const transformApiPolicy = (apiPolicy: ApiPolicy): AppPolicy => {
  let actionStatus: PolicyActionStatus = 'default_policy_type';

  // Determine actionStatus based on 'id' prefix or other API fields if available
  // This logic attempts to match the UI screenshot behavior
  if (apiPolicy.id.startsWith('auto_')) {
    actionStatus = 'auto_policy_type';
  } else if (apiPolicy.id.startsWith('demo_')) {
    actionStatus = 'demo_policy_type';
  }
  // You might have more specific logic if the API provided a direct 'action_type' field

  return {
    id: apiPolicy.id,
    policyDescription: apiPolicy.name, // 'name' from API is the description
    enabled: apiPolicy.active,         // 'active' from API determines if it's enabled
    actionStatus: actionStatus,
  };
};

export function usePolicyData() {
  const [allPolicies, setAllPolicies] = useState<AppPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial load
  const [isRefreshing, setIsRefreshing] = useState(false); // For background updates
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE); // Uncomment if you want dynamic itemsPerPage

  const isInitialFetch = useRef(true);

  const fetchPolicies = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
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
        // Only reset to first page on the very first successful fetch if desired,
        // or if the current page becomes invalid (handled by another useEffect).
      } else {
        throw new Error(data.message || "Invalid API response structure or error status");
      }
    } catch (e: any) {
      console.error("Failed to fetch policies:", e);
      setError(e.message || "Failed to load policy data.");
      // Optionally clear policies on error:
      // setAllPolicies([]);
    } finally {
      if (!isBackgroundRefresh) {
        setIsLoading(false);
      }
      setIsRefreshing(false);
      isInitialFetch.current = false; // Mark initial fetch as done
    }
  // }, [itemsPerPage]); // Add itemsPerPage to dependencies if it's dynamic and affects fetch (e.g., server-side pagination)
  }, []); // No dependencies needed if itemsPerPage is constant and not used in fetch URL

  useEffect(() => {
    // Initial fetch
    fetchPolicies(false);

    // Polling for background updates
    const intervalId = setInterval(() => {
      fetchPolicies(true); // Pass true to indicate it's a background refresh
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchPolicies]); // fetchPolicies is memoized by useCallback

  // Recalculate total pages whenever allPolicies or itemsPerPage changes
  // const T_ITEMS_PER_PAGE = itemsPerPage; // Use this if itemsPerPage is dynamic
  const T_ITEMS_PER_PAGE = ITEMS_PER_PAGE; // Use this if itemsPerPage is constant
  const totalPages = Math.ceil(allPolicies.length / T_ITEMS_PER_PAGE);

  // Effect to adjust current page if it becomes out of bounds
  useEffect(() => {
    if (allPolicies.length > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1); // Go to last valid page or first if no pages
    } else if (allPolicies.length === 0 && !isInitialFetch.current) {
        setCurrentPage(1); // Reset to page 1 if list becomes empty after initial load
    }
  // }, [allPolicies, currentPage, totalPages, itemsPerPage]); // Add itemsPerPage if it's dynamic
  }, [allPolicies, currentPage, totalPages]);


  const policiesOnCurrentPage = allPolicies.slice(
    (currentPage - 1) * T_ITEMS_PER_PAGE,
    currentPage * T_ITEMS_PER_PAGE
  );

  // Update policy (local state for now, API call to be added for persistence)
  const updatePolicy = (policyId: string, updatedPolicyData: Partial<AppPolicy>) => {
    setAllPolicies((prevPolicies) =>
      prevPolicies.map((policy) =>
        policy.id === policyId ? { ...policy, ...updatedPolicyData } : policy
      )
    );
    // TODO: Implement API call to persist the 'enabled' (active) state change.
    // The API call would likely target an endpoint like:
    // PATCH http://localhost:9926/PolicyResource/{policyId}
    // with a body like: { "active": newEnabledState }
    // where newEnabledState is updatedPolicyData.enabled
    console.log(`Policy ${policyId} updated locally. New data:`, updatedPolicyData);
  };

  return {
    policies: policiesOnCurrentPage,
    allPoliciesCount: allPolicies.length,
    isLoading,      // For initial load
    isRefreshing,   // For background updates (optional, use if you want a subtle indicator)
    error,
    fetchPolicies: () => fetchPolicies(false), // Expose a way to manually trigger a full refresh
    updatePolicy
  };
}