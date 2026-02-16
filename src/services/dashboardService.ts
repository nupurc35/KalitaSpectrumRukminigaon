import { supabase } from "../lib/superbase";
import { restaurantId } from "@/config/env";

export interface DashboardMetrics {
  newLeadsToday: number;
  contactedToday: number;
  reservationsCreated: number;
  completedReservations: number;
  overdueFollowUps: number;
  followUpsDueToday: number;
  neverContacted24h: number;
  last14DaysRevenue: number[];
  totalRevenue: number;
  topMenuItems: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
}

export interface AttentionLead {
  id: string;
  phone: string;
  status: string;
  next_follow_up?: string;
  created_at: string;
  last_contacted_at?: string;
}

export interface RecentActivity {
  id: string;
  lead_id: string;
  event_type: string;
  created_at: string;
  leads: {
    phone: string;
  };
}

// 1. Updated to use direct queries instead of RPC
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  
  // Get start of today in local time
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayISO = startOfDay.toISOString();
  
  const todayDate = now.toISOString().split("T")[0];
  
  // Get yesterday's date for "never contacted" leads
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Parallel queries for all metrics
  const [
    newLeadsResult,
    contactedData,
    reservationsResult,
    completedResult,
    overdueResult,
    dueTodayResult,
    neverContactedResult
  ] = await Promise.all([
    // 1. New Leads Today
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startOfDayISO),
    
    // 2. Contacted Today (from lead_events)
    supabase
      .from("lead_events")
      .select("lead_id, leads!inner(restaurant_id)")
      .eq("leads.restaurant_id", restaurantId)
      .eq("event_type", "contacted")
      .gte("created_at", startOfDayISO),
    
    // 3. Reservations Created (total, not just today)
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("status", "pending")
      .or("status.eq.confirmed"),
    
    // 4. Completed Reservations
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("status", "completed"),
    
    // 5. Overdue Follow-ups
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .lt("next_follow_up", todayDate)
      .not("status", "in", '("Reservation Created","Closed Won","Closed Lost")'),
    
    // 6. Follow-ups Due Today
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("next_follow_up", todayDate),
    
    // 7. Never Contacted (>24h old, status=New)
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("status", "New")
      .lt("created_at", yesterday)
  ]);

  // Count unique contacted leads
  const contactedToday = new Set(contactedData?.data?.map((e: any) => e.lead_id)).size;

  return {
    newLeadsToday: newLeadsResult.count || 0,
    contactedToday: contactedToday || 0,
    reservationsCreated: reservationsResult.count || 0,
    completedReservations: completedResult.count || 0,
    overdueFollowUps: overdueResult.count || 0,
    followUpsDueToday: dueTodayResult.count || 0,
    neverContacted24h: neverContactedResult.count || 0,
    last14DaysRevenue: [], // TODO: Implement if needed
    totalRevenue: 0, // TODO: Implement if needed
    topMenuItems: [] // TODO: Implement if needed
  };
}

// 2. Add this new function at the bottom
export async function getRecentActivity(): Promise<RecentActivity[]> {
  const { data, error } = await supabase
    .from("lead_events")
    .select(`
      id,
      event_type,
      created_at,
      leads!inner ( phone, restaurant_id )
    `)
    .eq("leads.restaurant_id", restaurantId)  // ✅ Filter by restaurant
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

export async function getAttentionLeads(): Promise<{
  overdue: AttentionLead[];
  today: AttentionLead[];
  never: AttentionLead[];
}> {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [overdue, todayLeads, never] = await Promise.all([
    supabase.from("leads").select("id, phone, status, next_follow_up, created_at, last_contacted_at")
      .eq("restaurant_id", restaurantId)
      .lt("next_follow_up", today)
      .not("status", "in", '("Reservation Created","Closed Won","Closed Lost")')
      .limit(10),

    supabase.from("leads").select("id, phone, status, next_follow_up, created_at, last_contacted_at")
      .eq("restaurant_id", restaurantId)
      .eq("next_follow_up", today)
      .limit(10),

    supabase.from("leads").select("id, phone, status, next_follow_up, created_at, last_contacted_at")
      .eq("restaurant_id", restaurantId)
      .eq("status", "New")
      .lt("created_at", yesterday)
      .limit(10)
  ]);

  return {
    overdue: overdue.data || [],
    today: todayLeads.data || [],
    never: never.data || []
  };
}