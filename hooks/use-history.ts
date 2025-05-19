// src/hooks/useHistory.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { HistoryLogItem, HistoryApiResponse } from '../lib/types'; // Ensure this path is correct

const API_URL = 'http://localhost:9926/HistoryLogs';

interface UseHistoryState {
  data: HistoryLogItem[] | null;
  loading: boolean;
  fail: Error | null; // 'fail' is a bit unconventional, 'error' is more common
}

interface UseHistoryReturn extends UseHistoryState {
  refetch: () => Promise<void>;
}

interface UseHistoryOptions {
  pollingInterval?: number; // Interval in milliseconds. 0 or undefined to disable polling.
}

const useHistory = (options?: UseHistoryOptions): UseHistoryReturn => {
  const [historyState, setHistoryState] = useState<UseHistoryState>({
    data: null,
    loading: true,
    fail: null,
  });

  // Ref to store the abort controller for ongoing fetches
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchHistoryLogs = useCallback(async (isPollingFetch = false) => {
    // If it's not a polling fetch, or if it is but we are already loading something else,
    // potentially cancel previous request to avoid race conditions if a manual refetch happens
    // during a poll.
    if (!isPollingFetch && abortControllerRef.current) {
        abortControllerRef.current.abort();
    }

    const currentAbortController = new AbortController();
    abortControllerRef.current = currentAbortController;

    // Only set loading to true for the initial fetch or manual refetches,
    // not for background polling, to avoid UI flickering.
    // Or, if you want a loading indicator for polls, remove `!isPollingFetch &&`
    if (!isPollingFetch) {
      setHistoryState(prevState => ({ ...prevState, loading: true, fail: null }));
    } else {
      // For polling, we might not want to show a global loading state,
      // but we still want to clear previous errors if any.
      setHistoryState(prevState => ({ ...prevState, fail: null }));
    }

    try {
      const response = await fetch(API_URL, { signal: currentAbortController.signal });

      if (currentAbortController.signal.aborted) {
        console.log('Fetch aborted (new request initiated or component unmounted)');
        return; // Don't process an aborted request
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData) || errorMessage;
        } catch (e) {
          // If parsing error body fails, stick to the status
        }
        throw new Error(errorMessage);
      }

      const result: HistoryApiResponse = await response.json();

      if (currentAbortController.signal.aborted) {
        console.log('Fetch aborted after response received but before processing');
        return;
      }
      
      if (result && typeof result.status === 'number' && Array.isArray(result.data)) {
        const sortedData = result.data.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        });

        setHistoryState({
          data: sortedData,
          loading: false, // Always set loading to false after a successful fetch
          fail: null,
        });
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // This means the fetch was intentionally aborted, usually by a new fetch or unmount.
        // We might not want to set an error state in this case unless it's the initial load.
        console.log('Fetch aborted by AbortController.');
        // If it wasn't a polling fetch that was aborted, keep loading false
        if (!isPollingFetch) {
            setHistoryState(prevState => ({ ...prevState, loading: false }));
        }
      } else {
        setHistoryState(prevState => ({
          ...prevState, // Keep existing data if polling fails, or set to null for initial/manual fetch
          loading: false,
          fail: err instanceof Error ? err : new Error('An unknown error occurred'),
        }));
      }
    } finally {
        // If this controller was the one stored, clear it
        if (abortControllerRef.current === currentAbortController) {
            abortControllerRef.current = null;
        }
    }
  }, []); // No dependencies needed for fetchHistoryLogs itself if API_URL is constant

  // Effect for initial fetch and polling
  useEffect(() => {
    fetchHistoryLogs(); // Initial fetch

    let intervalId: NodeJS.Timeout | undefined;
    if (options?.pollingInterval && options.pollingInterval > 0) {
      intervalId = setInterval(() => {
        console.log('Polling for history logs...');
        // Pass true to indicate this is a polling fetch
        fetchHistoryLogs(true);
      }, options.pollingInterval);
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Abort any ongoing fetch on unmount
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchHistoryLogs, options?.pollingInterval]); // Re-run if pollingInterval changes

  return {
    ...historyState,
    // Ensure refetch uses the non-polling version of fetchHistoryLogs
    refetch: () => fetchHistoryLogs(false),
  };
};

export default useHistory;