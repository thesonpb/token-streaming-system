"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useGeo from "@/hooks/use-geo";
import { useState, useEffect } from "react";

export default function GeoPage() {
  const { locations, fetchGeoLocations, updateGeoLocations } = useGeo();

  const [inputLocations, setInputLocations] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false); // For PUT request feedback
  const [isRefreshing, setIsRefreshing] = useState(false); // For GET request feedback

  useEffect(() => {
    setInputLocations(locations.join(", "));
  }, [locations]);

  const handleUpdate = async () => {
    const newLocsArray = inputLocations
      .split(",")
      .map((loc) => loc.trim())
      .filter((loc) => loc !== "");

    if (newLocsArray.length > 0) {
      setIsUpdating(true);
      await updateGeoLocations(newLocsArray);
      setIsUpdating(false);
    } else {
      alert("Please enter valid locations separated by commas.");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGeoLocations();
    setIsRefreshing(false);
  };

  return (
    <div className="w-full">
      <div className="bg-card/50 backdrop-blur">
        <div>
          <div className="min-h-screen  flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
              <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
                      Current Locations
                    </h2>
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing || isUpdating}
                      className="px-4 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-700/30 hover:bg-sky-200 dark:hover:bg-sky-700/50 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isRefreshing ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>

                  {locations.length > 0 ? (
                    <ul className="space-y-3">
                      {locations.map((loc, index) => (
                        <li
                          key={index}
                          className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md"
                        >
                          <span className="text-indigo-500 dark:text-indigo-400 mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          <span className="text-lg font-medium text-slate-700 dark:text-slate-200">
                            {loc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic py-4 text-center">
                      {isRefreshing
                        ? "Loading locations..."
                        : "No locations configured."}
                    </p>
                  )}
                </div>

                {/* Separator - could use Radix Separator here */}
                <hr className="border-slate-200 dark:border-slate-700" />
                {/* Example with Radix Separator:
          <SeparatorPrimitive.Root className="h-px bg-slate-200 dark:bg-slate-700 data-[orientation=horizontal]:my-6" />
          */}

                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Update Locations
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Enter locations separated by commas (e.g., US, VN, CA).
                  </p>
                  <div className="space-y-4">
                    <label htmlFor="locations-input" className="sr-only">
                      Enter Locations
                    </label>
                    <input
                      id="locations-input"
                      type="text"
                      value={inputLocations}
                      onChange={(e) => setInputLocations(e.target.value)}
                      placeholder="US, VN, JP"
                      disabled={isUpdating || isRefreshing}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 transition-colors disabled:opacity-60"
                    />
                    <button
                      onClick={handleUpdate}
                      disabled={
                        isUpdating || isRefreshing || !inputLocations.trim()
                      }
                      className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:bg-sky-400 dark:disabled:bg-sky-700/60 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
