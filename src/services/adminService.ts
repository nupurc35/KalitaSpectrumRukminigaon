import { supabase } from "../lib/superbase";

export const fetchLeads = async (
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

  return { data: data ?? [] };
};


export const fetchReservations = async () => {
  return supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });
};

export const updateLeadStatus = async (id: string, status: "New" | "Contacted") => {
  return supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select();
};

export const deleteLead = async (id: string) => {
  return supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .select();
};

/*export const fetchLeads = async () => {
  console.log("fetchLeads called");

  const res = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("fetchLeads result:", res);

  return res;
}; */
