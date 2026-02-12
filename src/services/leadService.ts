import { supabase } from "../lib/superbase";
import { restaurantId } from "@/config/env";

export const createLead = async (lead: {
  name?: string;
  phone?: string;
  intent: "whatsapp" | "callback" | "contact";
  message?: string;
  source: "website" | "chat_concierge";
}) => {
  const { data, error } = await supabase.functions.invoke("crm-handler", {
    body: {
      action: "create_lead",
      payload: {
        ...lead,
        restaurant_id: restaurantId,
      },
    },
  });

  if (error) {
    const status = (error as any)?.context?.status;
    if (status === 429) {
      return { error: "Too many requests. Please wait a minute and try again." };
    }
    return { error: error.message };
  }

  if (data?.success === false) {
    return { error: data.error ?? "Request failed." };
  }

  return { error: null };
};


/* Mark lead as contacted */
export const markContacted = async (leadId: string) => {
  const { data, error } = await supabase.functions.invoke("crm-handler", {
    body: {
      action: "mark_contacted",
      payload: {
        lead_id: leadId,
        restaurant_id: restaurantId,
      },
    },
  });

  if (error) throw new Error(error.message);
  if (data?.success === false) throw new Error(data.error);

  return null;
};


/**
 * Convert a lead to a reservation
 * Orchestrated via crm-handler
 */
export const convertLeadToReservation = async (
  leadId: string,
  options?: { date?: string; time?: string; guests?: number }
) => {
  const { data, error } = await supabase.functions.invoke("crm-handler", {
    body: {
      action: "convert_lead",
      payload: {
        lead_id: leadId,
        restaurant_id: restaurantId,
        ...options,
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
    throw new Error(data.error ?? "Conversion failed.");
  }

  return { reservation: data?.data?.reservation };
};

/**
 * Close a lead as lost
 * Orchestrated via crm-handler
 */
export const closeLeadAsLost = async (leadId: string) => {
  const { data, error } = await supabase.functions.invoke("crm-handler", {
    body: {
      action: "close_lead",
      payload: {
        lead_id: leadId,
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
    throw new Error(data.error ?? "Failed to close lead.");
  }

  return null;
};

/**
 * Get all leads (read-only)
 */
export const getLeads = async (
  page: number = 0,
  pageSize: number = 20
) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("leads")
    .select("id,phone,intent,source,created_at,status")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Lead fetch error:", error);
    throw error;
  }

  return data ?? [];
};


