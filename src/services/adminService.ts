import { supabase } from "../lib/superbase";

export const fetchLeads = async () => {
  return supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
};

export const fetchReservations = async () => {
  return supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });
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
