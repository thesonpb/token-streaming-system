// hooks/use-user-data.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { AppUser, ApiUserToken, AdminUsersApiResponse } from "@/lib/types"; // Adjust path
import { AUTH } from "@/constants";

const ITEMS_PER_PAGE = 10;

// Helper to transform API data to AppUser
const transformApiUser = (apiToken: ApiUserToken): AppUser => ({
    id: apiToken.token,
    username: apiToken.username,
    apiStatus: apiToken.status,
    hits1m: apiToken.access_count_1m,
    hits5m: apiToken.access_count_5m,
    hits15m: apiToken.access_count_15m,
    concurrents: apiToken.concurrent_users,
});

export function useUserData() {
    const [allUsers, setAllUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
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
            const response = await fetch("http://localhost:9926/AdminUsers", {
                headers: {
                    Authorization: `Basic ${AUTH}`,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: AdminUsersApiResponse = await response.json();

            if (data.status === 200 && data.tokens) {
                const transformedUsers = data.tokens.map(transformApiUser);
                setAllUsers(transformedUsers);
            } else {
                throw new Error(
                    data.status.toString() ||
                        "Invalid API response structure or error status"
                );
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
        }, 2000); // Consider increasing this interval for production

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [fetchUsers]);

    const totalPages = Math.ceil(allUsers.length / ITEMS_PER_PAGE);

    useEffect(() => {
        if (allUsers.length > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages || 1); // Go to last valid page or first if no pages
        } else if (allUsers.length === 0 && !isInitialFetch.current) {
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

    // New function to apply policy to a token
    const autoPolicyToToken = useCallback(async (tokenId: string) => {
        // console.log(`Attempting to apply policy to token: ${tokenId}`); // For debugging
        try {
            const response = await fetch(
                "http://localhost:9926/ApplyPolicyToToken",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Basic ${AUTH}`,
                        // Add any other necessary headers, like Authorization if required
                    },
                    body: JSON.stringify({ token: tokenId }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: "Failed to parse error response",
                }));
                console.error(
                    `HTTP error! status: ${response.status}`,
                    errorData
                );
                throw new Error(
                    `Failed to apply policy. Status: ${
                        response.status
                    }. Message: ${errorData.message || response.statusText}`
                );
            }

            const result = await response.json();
            // console.log("Policy applied successfully:", result); // For debugging
            // Optionally, you might want to update the local state or re-fetch users
            // For example, if applying a policy changes user status that is displayed.
            fetchUsers(true); // Re-fetch users in the background after applying policy
            return { success: true, data: result };
        } catch (e: any) {
            console.error("Error applying policy to token:", e);
            setError(e.message || "Failed to apply policy to token."); // Update the main error state
            return { success: false, error: e.message || "Unknown error" };
        }
    }, []);
    return {
        users: usersOnCurrentPage,
        allUsersCount: allUsers.length,
        isLoading,
        isRefreshing,
        error,
        fetchUsers: () => fetchUsers(false),
        updateUser,
        currentPage,
        setCurrentPage,
        totalPages,
        autoPolicyToToken,
    };
}
