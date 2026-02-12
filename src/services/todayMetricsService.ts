import { supabase } from "../lib/superbase";
import { restaurantId } from "@/config/env";

export interface TodayMetrics {
  newLeads: number;
  contactedToday: number;
  reservationsCreated: number;
  completedToday: number;
  cancelledToday: number;
  leadToReservationRate: number;
  reservationToCompletionRate: number;
}

/**
 * Fetches today's CRM metrics for the admin dashboard.
 * All date filtering is done server-side using UTC ISO strings.
 */
export async function getTodayMetrics(): Promise<TodayMetrics> {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const todayStartISO = todayStart.toISOString();
  const todayDate = new Date().toISOString().split("T")[0];

  // 1. New Leads Today
  const { count: newLeads = 0 } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .gte("created_at", todayStartISO);

  // 2. Contacted Today
  const { count: contactedToday = 0 } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("status", "Contacted")
    .gte("last_contacted_at", todayStartISO)

  // 3. Reservations Created Today
  const { count: reservationsCreated = 0 } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .gte("created_at", todayStartISO);


  //4. Reservations confirmed Today
  const { count: confirmedToday = 0 } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("date", todayDate)
    .eq("status", "confirmed")
    



  // 5. Completed Reservations Today
  const { count: completedToday = 0 } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("date", todayDate)
    .eq("status", "completed")
    

  // 6. Cancelled Reservations Today
  const { count: cancelledToday = 0 } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("date", todayDate)
    .eq("status", "cancelled")
    

  // Conversion rates
  const leadToReservationRate = newLeads > 0 ? (reservationsCreated / newLeads) * 100 : 0;
  const reservationToCompletionRate = reservationsCreated > 0 ? (completedToday / reservationsCreated) * 100 : 0;

  return {
    newLeads,
    contactedToday,
    reservationsCreated,
    completedToday,
    cancelledToday,
    leadToReservationRate: Number(leadToReservationRate.toFixed(1)),
    reservationToCompletionRate: Number(reservationToCompletionRate.toFixed(1)),
  };
}
