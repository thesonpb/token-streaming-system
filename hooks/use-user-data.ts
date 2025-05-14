// hooks/use-user-data.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { AppUser, ApiUserToken, AdminUsersApiResponse } from "@/lib/types"; // Adjust path

const ITEMS_PER_PAGE = 10; // Define items per page

// Helper to transform API data to AppUser
const transformApiUser = (apiToken: ApiUserToken): AppUser => ({
  id: apiToken.token,
  username: apiToken.username,
  apiStatus: apiToken.status,
  hits1m: apiToken.access_count_1m,
  hits5m: apiToken.access_count_5m,
  concurrents: 0, // Assuming these are not in ApiUserToken or will be updated elsewhere
  hits15m: 0,    // Same as above
});

export function useUserData() {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial load
  const [isRefreshing, setIsRefreshing] = useState(false); // For background updates
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Ref to track if it's the initial fetch
  const isInitialFetch = useRef(true);

  const fetchUsers = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const response = await fetch("http://localhost:9926/AdminUsers");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: AdminUsersApiResponse = await response.json();

      if (data.status === 200 && data.tokens) {
        const transformedUsers = data.tokens.map(transformApiUser);
        setAllUsers(transformedUsers);
      } else {
        throw new Error(data.status.toString() || "Invalid API response structure or error status");
      }
    } catch (e: any) {
      console.error("Failed to fetch users:", e);
      setError(e.message || "Failed to load user data.");
    } finally {
      if (!isBackgroundRefresh) {
        setIsLoading(false);
      }
      setIsRefreshing(false);
      isInitialFetch.current = false; // Mark initial fetch as done
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchUsers(false);

    // Polling for background updates
    const intervalId = setInterval(() => {
      fetchUsers(true); // Pass true to indicate it's a background refresh
    }, 200);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchUsers]); // fetchUsers is memoized by useCallback

  // Recalculate total pages whenever allUsers changes
  const totalPages = Math.ceil(allUsers.length / ITEMS_PER_PAGE);

  // Effect to adjust current page if it becomes out of bounds
  useEffect(() => {
    if (allUsers.length > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1); // Go to last valid page or first if no pages
    }
    // If allUsers becomes empty and it wasn't an initial load (error or data cleared)
    // you might want to reset to page 1.
    else if (allUsers.length === 0 && !isInitialFetch.current) {
        setCurrentPage(1);
    }
  }, [allUsers, currentPage, totalPages]);


  const usersOnCurrentPage = allUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  const updateUser = (userId: string, updatedUserData: Partial<AppUser>) => {
    setAllUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, ...updatedUserData } : user
      )
    );
  };

  return {
    users: usersOnCurrentPage,
    allUsersCount: allUsers.length,
    isLoading,      // For initial load
    isRefreshing,   // For background updates (optional, use if you want a subtle indicator)
    error,
    fetchUsers: () => fetchUsers(false), // Expose a way to manually trigger a full refresh
    updateUser,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}