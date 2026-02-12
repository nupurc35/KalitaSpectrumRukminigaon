import { supabase } from "@/lib/superbase";
import { restaurantId } from "@/config/env";

export interface ReservationData {
  name: string;
  email?: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  submittedAt: string;
}

export type ReservationInsertPayload = {
  name: string;
  email?: string | null;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string | null;
  status?: "confirmed" | "pending" | "cancelled" | "completed";
};

const RESERVATION_STORAGE_KEY = "kalita_spectrum_reservations";

/**
 * Save reservation to local storage
 */
export const saveReservationToLocalStorage = (data: ReservationData): void => {
  try {
    const existingReservations = getReservationsFromLocalStorage();
    const newReservation = {
      ...data,
      id: Date.now().toString(),
    };
    existingReservations.push(newReservation);
    localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(existingReservations));
  } catch (error) {
    console.error('Failed to save reservation to local storage:', error);
  }
};

/**
 * Get all reservations from local storage
 */
export const getReservationsFromLocalStorage = (): ReservationData[] => {
  try {
    const stored = localStorage.getItem(RESERVATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get reservations from local storage:', error);
    return [];
  }
};

/**
 * Create a new reservation
 * Orchestrated via crm-handler
 */
export const createReservation = async (payload: ReservationInsertPayload) => {
  const { data, error } = await supabase.functions.invoke("crm-handler", {
    body: {
      action: "create_reservation",
      payload: {
        ...payload,
        restaurant_id: restaurantId,
      },
    },
  });

  if (error) {
    const status = (error as any)?.context?.status;
    if (status === 429) {
      throw new Error("Too many requests. Please wait a minute and try again.");
    }
    throw new Error(error.message);
  }

  if (data?.success === false) {
    throw new Error(data.error ?? "Reservation failed.");
  }

  if (!data?.data?.id) {
    throw new Error("Reservation failed.");
  }

  return { id: data.data.id };
};

/**
 * Update reservation status
 * Orchestrated via crm-handler (cascades to related lead if exists)
 */
export const updateReservationStatus = async (
  reservationId: string,
  status: "confirmed" | "completed" | "cancelled"
) => {
  const { data, error } = await supabase.functions.invoke("crm-handler", {
    body: {
      action: "update_reservation_status",
      payload: {
        reservation_id: reservationId,
        restaurant_id: restaurantId,
        status,
      },
    },
  });

  if (error) {
    const status = (error as any)?.context?.status;
    if (status === 429) {
      throw new Error("Too many requests. Please wait a minute and try again.");
    }
    throw new Error(error.message);
  }

  if (data?.success === false) {
    throw new Error(data.error ?? "Failed to update reservation.");
  }

  return { reservation: data?.data?.reservation };
};
