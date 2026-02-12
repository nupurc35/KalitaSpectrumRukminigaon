import { supabase } from "../lib/superbase";
import { restaurantId } from "@/config/env";
import { convertLeadToReservation, closeLeadAsLost } from "./leadService";
import { updateReservationStatus } from "./reservationService";

export const fetchLeads = async (
  page: number = 0,
  pageSize: number = 20
) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("leads")
    .select("id,phone,intent,source,created_at,status,name,reservation_id,restaurant_id")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Lead fetch error:", error);
    throw error;
  }

  return { data: data ?? [] };
};


export const fetchReservations = async (
  page: number = 0,
  pageSize: number = 20
) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  return supabase
    .from("reservations")
    .select("id,name,phone,date,time,guests,occasion,status,created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .range(from, to);
};

export const updateLeadStatus = async (id: string, status: "New" | "Contacted" | "Closed Won" | "Closed Lost") => {
  return supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .select();
};

export const deleteLead = async (id: string) => {
  return supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurantId)
    .select();
};

/**
 * Admin convenience methods that delegate to service layer
 * Smart routing using crm-handler for coordinated operations
 */

export { convertLeadToReservation, closeLeadAsLost } from "./leadService";
export { updateReservationStatus } from "./reservationService";
