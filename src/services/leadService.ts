import { supabase } from "../lib/superbase";
import { restaurantId } from "@/config/env";

export interface CRMLead {
  id: string;
  phone: string;
  status: string;
  intent: string;
  source: string;
  created_at: string;
  next_follow_up?: string;
  last_contacted_at?: string;
  name?: string;
  message?: string;
}

export const createLead = async (lead: any) => {
  const { data, error } = await supabase.functions.invoke("crm-handler", {
    body: { action: "create_lead", payload: { ...lead, restaurant_id: restaurantId } },
  });
  
  if (error) throw error;
  return data;
};

/**
 * Updates lead status and sets the next follow-up date.
 * Also logs the event in 'lead_events'.
 */
export const markContacted = async (leadId: string, nextFollowUp?: string) => {
  const contactedAt = new Date().toISOString();

  // 1. Update the lead record
  const { error: updateError } = await supabase
    .from("leads")
    .update({
      status: 'Contacted',  // ✅ Changed to Capital case
      last_contacted_at: contactedAt,
      next_follow_up: nextFollowUp
    })
    .eq("id", leadId);

  if (updateError) throw updateError;

  // 2. Insert into lead_events
  return await supabase
    .from("lead_events")
    .insert({
      lead_id: leadId,
      event_type: 'contacted',
      created_at: contactedAt
    });
};

/**
 * Marks a lead as 'lost' or 'closed'
 */


/**
 * Helper to handle lead conversion logic
 */

export const deleteLead = async (leadId: string) => {
  return await supabase
    .from("leads")
    .update({ is_deleted: true })
    .eq("id", leadId);
};

export const getCRMLeads = async (page = 0, pageSize = 20): Promise<CRMLead[]> => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to);
  return data || [];
};

export const getCRMLeadsCount = async (): Promise<number> => {
  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("is_deleted", false);
  return count || 0;
};

/**
 * Search leads by phone number
 */
export const searchLeadsByPhone = async (phoneQuery: string): Promise<CRMLead[]> => {
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("is_deleted", false)
    .ilike("phone", `%${phoneQuery}%`)
    .order("created_at", { ascending: false });
  return data || [];
};

export const closeLeadAsLost = async (leadId: string) => {
  const { error } = await supabase
    .from("leads")
    .update({ status: 'Closed Lost' })  // ✅ Changed to Capital case
    .eq("id", leadId);
  
  if (error) throw error;

  // Log the event
  return await supabase
    .from("lead_events")
    .insert({
      lead_id: leadId,
      event_type: 'lost',
      created_at: new Date().toISOString()
    });
};

export const convertLeadToReservation = async (leadId: string, reservationId: string) => {
  const { error } = await supabase
    .from("leads")
    .update({
      status: 'Reservation Created',  // ✅ Changed to Capital case
      reservation_id: reservationId
    })
    .eq("id", leadId);
  
  if (error) throw error;

  // Log the event
  return await supabase
    .from("lead_events")
    .insert({
      lead_id: leadId,
      event_type: 'converted',
      created_at: new Date().toISOString()
    });
};