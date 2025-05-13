// hooks/use-user-data.ts
import { useState, useCallback, useEffect } from "react";
import { AppUser, ApiUserToken, AdminUsersApiResponse } from "@/lib/types"; // Adjust path

const ITEMS_PER_PAGE = 10; // Define items per page

// Helper to transform API data to AppUser
const transformApiUser = (apiToken: ApiUserToken): AppUser => ({
  id: apiToken.token,
  username: apiToken.username,
  apiStatus: apiToken.status,
  hits1m: apiToken.access_count_1m,
  hits5m: apiToken.access_count_5m,
  concurrents: 0,
  hits15m: 0,
  banned: false,
  // Add any other properties your AppUser needs
});

export function useUserData() {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]); // Stores all fetched users
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
        setAllUsers(transformedUsers);
        setCurrentPage(1); // Reset to first page on new fetch
      } else {
        throw new Error("Invalid API response structure or error status");
      }
    } catch (e: any) {
      console.error("Failed to fetch users:", e);
      setError(e.message || "Failed to load user data.");
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Calculate users for the current page
  const usersOnCurrentPage = allUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(allUsers.length / ITEMS_PER_PAGE);

  const updateUser = (userId: string, updatedUserData: Partial<AppUser>) => {
    setAllUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, ...updatedUserData } : user))
    );
  };

  // Note: Batch actions will operate on `allUsers` if you want them to affect
  // users not on the current page, or you can adjust them to only affect usersOnCurrentPage.
  // For simplicity here, they still modify `allUsers`.
  const batchUserBan = (userIds: string[]) => {
    setAllUsers((prevUsers) =>
      prevUsers.map((user) => (userIds.includes(user.id) ? { ...user, apiStatus: "banned" } : user))
    );
  };

  const batchUserUnban = (userIds: string[]) => {
    setAllUsers((prevUsers) =>
      prevUsers.map((user) => (userIds.includes(user.id) ? { ...user, apiStatus: "ok" } : user))
    );
  };

  return {
    users: usersOnCurrentPage, // Return only users for the current page
    allUsersCount: allUsers.length, // For displaying total items
    isLoading,
    error,
    fetchUsers,
    updateUser,
    batchUserBan,
    batchUserUnban,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}