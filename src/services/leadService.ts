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

export const getLeads = async (
  page: number = 0,
  pageSize: number = 20
) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Lead fetch error:", error);
    throw error;
  }

  return data ?? [];
};


