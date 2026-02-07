import { useEffect, useState } from "react";
import { supabase } from "@/lib/superbase";

export type Restaurant = {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  theme_color: string | null;
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
      .select("id,name,phone,address,theme_color")
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

  useEffect(() => {
    let isMounted = true;

    if (hasLoaded) {
      setRestaurant(cachedRestaurant);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    fetchRestaurant()
      .then((result) => {
        if (isMounted) {
          setRestaurant(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch restaurant:", err);
        if (isMounted) {
          setRestaurant(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { restaurant, loading };
};
