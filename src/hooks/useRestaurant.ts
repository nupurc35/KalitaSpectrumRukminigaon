import { useEffect, useState } from "react";
import { supabase } from "@/lib/superbase";
import { restaurantId } from "@/config/env";

export type Restaurant = {
  id: string;
  name: string | null;
  address: string | null;
};

let cachedRestaurant: Restaurant | null = null;
let inFlight: Promise<Restaurant | null> | null = null;
let hasLoaded = false;

const fetchRestaurant = async () => {
  if (cachedRestaurant) return cachedRestaurant;
  if (inFlight) return inFlight;
  if (hasLoaded) return cachedRestaurant;

  inFlight = (async () => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("id,name,address")
      .eq("id", restaurantId)
      .limit(1);

    if (error) {
      console.error("Failed to fetch restaurant:", error);
      inFlight = null;
      hasLoaded = true;
      return null;
    }

    const row = (data ?? [])[0] ?? null;
    cachedRestaurant = row;
    inFlight = null;
    hasLoaded = true;
    return row;
  })();

  return inFlight;
};

export const useRestaurant = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(cachedRestaurant);
  const [loading, setLoading] = useState(!hasLoaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (hasLoaded) {
      setRestaurant(cachedRestaurant);
      setLoading(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    fetchRestaurant()
      .then((result) => {
        if (isMounted) {
          if (result === null) {
            setError("Failed to load restaurant data. Please try again.");
          } else {
            setError(null);
          }
          setRestaurant(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch restaurant:", err);
        if (isMounted) {
          setRestaurant(null);
          setError("Unable to connect to the server. Please check your internet connection.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { restaurant, loading, error };
};
