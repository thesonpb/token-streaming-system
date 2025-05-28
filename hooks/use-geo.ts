// src/hooks/useGeo.ts
import { API_BASE_URL, AUTH } from "@/constants";
import { useState, useEffect, useCallback } from "react";

const API_URL = `${API_BASE_URL}/GeoLocation`;

interface GeoGetResponse {
    status: number;
    data: string[];
}

// GeoPutResponse interface might not be strictly needed if we don't check its content
// interface GeoPutResponse {
//   status: number;
//   message: string;
// }

interface UseGeoReturn {
    locations: string[];
    fetchGeoLocations: () => Promise<void>;
    updateGeoLocations: (newLocations: string[]) => Promise<void>;
    setLocations: React.Dispatch<React.SetStateAction<string[]>>;
}

const useGeo = (): UseGeoReturn => {
    const [locations, setLocations] = useState<string[]>([]);

    const fetchGeoLocations = useCallback(async () => {
        try {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Basic ${AUTH}`,
                },
            });
            if (!response.ok) {
                console.error(
                    `HTTP error! status: ${response.status} ${response.statusText}`
                );
                return; // Exit if response not ok
            }
            const result: GeoGetResponse = await response.json();
            if (result.status === 200 && result.data) {
                setLocations(result.data);
            } else {
                console.error(
                    `API Error on GET: Status ${
                        result.status
                    }, Data: ${JSON.stringify(result.data)}`
                );
            }
        } catch (err: any) {
            console.error("Failed to fetch geo locations:", err.message || err);
        }
    }, []);

    const updateGeoLocations = useCallback(async (newLocations: string[]) => {
        try {
            const response = await fetch(API_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${AUTH}`,
                },
                body: JSON.stringify({ locations: newLocations }),
            });

            if (!response.ok) {
                console.error(
                    `HTTP error! status: ${response.status} ${response.statusText}`
                );
                return; // Exit if response not ok
            }

            const result = await response.json(); // Assuming GeoPutResponse structure
            if (result.status === 200) {
                setLocations(newLocations); // Optimistically update
                console.log(
                    result.message ||
                        "Geo location configuration updated successfully"
                );
            } else {
                console.error(
                    `API Error on PUT: Status ${result.status}, Message: ${result.message}`
                );
            }
        } catch (err: any) {
            console.error(
                "Failed to update geo locations:",
                err.message || err
            );
        }
    }, []);

    useEffect(() => {
        fetchGeoLocations();
    }, [fetchGeoLocations]);

    return { locations, fetchGeoLocations, updateGeoLocations, setLocations };
};

export default useGeo;
