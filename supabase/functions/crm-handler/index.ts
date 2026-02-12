import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

type CrmAction = "create_lead" | "mark_contacted" | "create_reservation" | "convert_lead" | "update_reservation_status" | "close_lead";

interface CrmRequest {
  action: CrmAction;
  payload: Record<string, any>;
}

interface CrmResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: CrmResponse, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Initialize Supabase admin client with SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Create a new lead with status "New"
 */
const createLead = async (payload: {
  name?: string;
  phone?: string;
  intent: "whatsapp" | "callback" | "contact";
  message?: string;
  source: "website" | "chat_concierge";
  restaurant_id: string;
}): Promise<CrmResponse> => {
  const { data, error } = await supabase
    .from("leads")
    .insert([
      {
        restaurant_id: payload.restaurant_id,
        name: payload.name || null,
        phone: payload.phone || null,
        intent: payload.intent,
        message: payload.message || null,
        source: payload.source,
        status: "New",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Create lead error:", error);
    return { success: false, error: error.message };
  }
  console.log("Payload received:", payload);

  return { success: true, data };
};

/* contact the new lead and change its status to "contacted" */              

const newStatus = "Contacted";
console.log("Type of status:", typeof newStatus);
console.log("Value:", newStatus);

const markContacted = async (payload: {
  lead_id: string;
  restaurant_id: string;
}): Promise<CrmResponse> => {
  const { data, error } = await supabase
    .from("leads")
    .update({ status: "Contacted",
             last_contacted_at: new Date().toISOString(), })
    .eq("id", payload.lead_id)
    .eq("restaurant_id", payload.restaurant_id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
};

/**
 * Create a new reservation directly (not from lead conversion)
 */
const createReservation = async (payload: {
  name: string;
  email?: string | null;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string | null;
  restaurant_id: string;
  status?: "confirmed" | "pending" | "cancelled" | "completed";
}): Promise<CrmResponse> => {
  const { data, error } = await supabase
    .from("reservations")
    .insert([
      {
        restaurant_id: payload.restaurant_id,
        name: payload.name,
        email: payload.email || null,
        phone: payload.phone,
        date: payload.date,
        time: payload.time,
        guests: payload.guests,
        occasion: payload.occasion || null,
        status: payload.status || "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Create reservation error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
};

/**
 * Convert a lead to reservation
 * Fetch lead, create reservation, update lead with reservation_id and status
 */
const convertLead = async (payload: {
  lead_id: string;
  restaurant_id: string;
  date?: string;
  time?: string;
  guests?: number;
}): Promise<CrmResponse> => {
  try {
    // Fetch the lead
    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", payload.lead_id)
      .eq("restaurant_id", payload.restaurant_id)
      .single();

    if (fetchError || !lead) {
      return { success: false, error: "Lead not found" };
    }

    // Prepare reservation data
    const today = payload.date || new Date().toISOString().split("T")[0];
    const time = payload.time || "19:00";
    const guests = payload.guests || 2;
    const reservationName = lead.name || "Guest";

    // Create reservation
    const { data: reservation, error: createError } = await supabase
      .from("reservations")
      .insert([
        {
          restaurant_id: payload.restaurant_id,
          name: reservationName,
          phone: lead.phone,
          date: today,
          time,
          guests,
          source: lead.source,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("Create reservation error:", createError);
      return { success: false, error: "Failed to create reservation" };
    }

    // Update lead with reservation info
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        status: "Reservation Created",
        reservation_id: reservation.id,
      })
      .eq("id", payload.lead_id)
      .eq("restaurant_id", payload.restaurant_id);

    if (updateError) {
      console.error("Update lead error:", updateError);
      return { success: false, error: "Failed to update lead" };
    }

    return { success: true, data: { reservation } };
  } catch (error) {
    console.error("Convert lead error:", error);
    return { success: false, error: "Internal server error" };
  }
};
/**
 * Update reservation status and cascade status to related lead
 */
const updateReservationStatus = async (payload: {
  reservation_id: string;
  restaurant_id: string;
  status: "confirmed" | "completed" | "cancelled";
}): Promise<CrmResponse> => {
  try {
    // Update reservation
    const { data: reservation, error: updateError } = await supabase
      .from("reservations")
      .update({ status: payload.status })
      .eq("id", payload.reservation_id)
      .eq("restaurant_id", payload.restaurant_id)
      .select()
      .single();

    if (updateError) {
      console.error("Update reservation error:", updateError);
      return { success: false, error: "Failed to update reservation" };
    }

    // Find and update related lead if exists
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("reservation_id", payload.reservation_id)
      .eq("restaurant_id", payload.restaurant_id)
      .single();

    if (lead) {
      let leadStatus: "Closed Won" | "Closed Lost" = "Closed Lost";

      if (payload.status === "completed") {
        leadStatus = "Closed Won";
      } else if (payload.status === "cancelled") {
        leadStatus = "Closed Lost";
      }

      const { error: leadUpdateError } = await supabase
        .from("leads")
        .update({ status: leadStatus })
        .eq("id", lead.id)
        .eq("restaurant_id", payload.restaurant_id);

      if (leadUpdateError) {
        console.error("Update lead status error:", leadUpdateError);
        // Don't fail the whole operation if lead update fails
      }
    }

    return { success: true, data: { reservation } };
  } catch (error) {
    console.error("Update reservation status error:", error);
    return { success: false, error: "Internal server error" };
  }
};

/**
 * Close a lead as "Closed Lost"
 */
const closeLead = async (payload: {
  lead_id: string;
  restaurant_id: string;
}): Promise<CrmResponse> => {
  const { data, error } = await supabase
    .from("leads")
    .update({ status: "Closed Lost" })
    .eq("id", payload.lead_id)
    .eq("restaurant_id", payload.restaurant_id)
    .select()
    .single();

  if (error) {
    console.error("Close lead error:", error);
    return { success: false, error: "Failed to close lead" };
  }

  return { success: true, data };
};

/**
 * Main request handler
 */
serve(async (req) => {
  // Handle OPTIONS preflight immediately
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  // Parse JSON payload
  let body: CrmRequest | null = null;
  try {
    body = (await req.json()) as CrmRequest;
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON payload" }, 400);
  }

  // Validate required fields
  if (!body || !body.action || !body.payload) {
    return jsonResponse({ success: false, error: "Missing action or payload" }, 400);
  }

  // Main action handler with error catching
  try {
    let response: CrmResponse;

    switch (body.action) {
      case "create_lead":
        response = await createLead(body.payload as any);
        break;
      case "mark_contacted":
        response = await markContacted(body.payload as any);
        break;
      
      case "create_reservation":
        response = await createReservation(body.payload as any);
        break;

      case "convert_lead":
        response = await convertLead(body.payload as any);
        break;

      case "update_reservation_status":
        response = await updateReservationStatus(body.payload as any);
        break;

      case "close_lead":
        response = await closeLead(body.payload as any);
        break;

      default:
        return jsonResponse({ success: false, error: "Unknown action" }, 400);
    }

    // Return with appropriate status code
    const statusCode = response.success ? 200 : 400;
    return jsonResponse(response, statusCode);
  } catch (error) {
    console.error("CRM handler error:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      500
    );
  }
});
