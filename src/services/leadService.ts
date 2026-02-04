import { supabase } from "../lib/superbase";

export const createLead = async (lead: {
  restaurant_id: string;
  name?: string;
  phone?: string;
  intent: "whatsapp" | "callback" | "contact";
  message?: string;
  source: "website";
}) => {
  return supabase.from("leads").insert([
    {
      ...lead,
      created_at: new Date().toISOString(),
    },
  ]);
};