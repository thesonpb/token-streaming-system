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
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
                      Current GEO controls
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    when a new token is issued, it will allow these locations:
                  </p>
                  {locations.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {locations.map((loc, index) => (
                        <li key={index}>{loc}</li>
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

                <hr className="border-slate-200 dark:border-slate-700" />

                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Update GEO controls
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Countries to allow (2 letter country code comma separated list for demo)
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
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:bg-sky-400 dark:disabled:bg-sky-700/60 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Updating..." : "Enable Locations"}
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
