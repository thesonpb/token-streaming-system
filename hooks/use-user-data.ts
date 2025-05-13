// hooks/use-user-data.ts
import { useState, useCallback, useEffect } from "react";
import { AppUser, ApiUserToken, AdminUsersApiResponse } from "@/lib/types"; // Adjust path

// Helper to transform API data to AppUser
const transformApiUser = (apiToken: ApiUserToken): AppUser => ({
  id: apiToken.token, // Use token as the unique ID
  username: apiToken.username,
  apiStatus: apiToken.status,
  hits1m: apiToken.access_count_1m,
  hits5m: apiToken.access_count_3m,
  // Initialize missing fields. These can be updated by simulation or other logic.
  concurrents: 0, // Or fetch/calculate if available elsewhere
  hits15m: apiToken.access_count_5m,     // Or fetch/calculate if available elsewhere
  // banned: false,  // Default to not banned
});


export function useUserData() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:9926/AdminUsers");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: AdminUsersApiResponse = await response.json();

      if (data.status === 200 && data.tokens) {
        const transformedUsers = data.tokens.map(transformApiUser);
        setUsers(transformedUsers);
      } else {
        throw new Error("Invalid API response structure or error status");
      }
    } catch (e: any) {
      console.error("Failed to fetch users:", e);
      setError(e.message || "Failed to load user data.");
      setUsers([]); // Clear users on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch when the hook is first used
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const updateUser = (userId: string, updatedUserData: Partial<AppUser>) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, ...updatedUserData } : user))
    );
  };

  // const toggleUserBan = (userId: string) => {
  //   setUsers((prevUsers) =>
  //     prevUsers.map((user) => (user.id === userId ? { ...user, banned: !user.banned } : user))
  //   );
  // };

  const batchUserBan = (userIds: string[]) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (userIds.includes(user.id) ? { ...user, banned: true } : user))
    );
  };

  const batchUserUnban = (userIds: string[]) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (userIds.includes(user.id) ? { ...user, banned: false } : user))
    );
  };

  return {
    users,
    isLoading,
    error,
    fetchUsers, // Expose fetchUsers if you want to manually refresh
    updateUser,
    // toggleUserBan,
    batchUserBan,
    batchUserUnban,
  };
}