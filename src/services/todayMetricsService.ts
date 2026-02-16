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
 * Fetches today's CRM metrics.
 * Uses persistent 'lead_events' data and standardized local start-of-day logic.
 */
export async function getTodayMetrics(): Promise<TodayMetrics> {
  const now = new Date();

  // Standardize Local Start of Day: 00:00:00.000
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayISO = startOfDay.toISOString();

  const todayDate = now.toISOString().split("T")[0];

  // 1. New Leads Today
  const { count: newLeads = 0 } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .gte("created_at", startOfDayISO);

  // 2. Contacted Today (from lead_events, counting unique leads)
  const { data: contactedData } = await supabase
    .from("lead_events")
    .select("lead_id, leads!inner(restaurant_id)")
    .eq("leads.restaurant_id", restaurantId)
    .eq("event_type", "contacted")
    .gte("created_at", startOfDayISO);

  // Count unique lead IDs to match dashboardService.ts exactly
  const contactedToday = new Set(contactedData?.map((e: any) => e.lead_id)).size;

  // 3. Reservations Created Today
  const { count: reservationsCreated = 0 } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .gte("created_at", startOfDayISO);

  // 4. Completed Reservations Today
  const { count: completedToday = 0 } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("date", todayDate)
    .eq("status", "completed");

  // 5. Cancelled Reservations Today
  const { count: cancelledToday = 0 } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("date", todayDate)
    .eq("status", "cancelled");

  // Conversion rates
  const leadToReservationRate = newLeads > 0 ? (reservationsCreated / newLeads) * 100 : 0;
  const reservationToCompletionRate = reservationsCreated > 0 ? (completedToday / reservationsCreated) * 100 : 0;

  return {
    newLeads: newLeads || 0,
    contactedToday: contactedToday || 0,
    reservationsCreated: reservationsCreated || 0,
    completedToday: completedToday || 0,
    cancelledToday: cancelledToday || 0,
    leadToReservationRate: Number(leadToReservationRate.toFixed(1)),
    reservationToCompletionRate: Number(reservationToCompletionRate.toFixed(1)),
  };
}
