import React, { useEffect, useState } from "react";
import { fetchLeads,fetchReservations} from "../../services/adminService";
import AdminHeader from "./adminNavbar";
import { supabase } from "@/lib/superbase";
const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"leads" | "reservations">("leads");
  const [loading, setLoading] = useState(true);




  useEffect(() => {
    const loadData = async () => {
      const { data: leadsData } = await fetchLeads();
     const { data: reservationData } = await fetchReservations();
     const { data: sessionData } = await supabase.auth.getSession(); // temporary
     console.log("SESSION:", sessionData.session); //temporary
      setLeads(leadsData || []);
      setReservations(reservationData || []);
    };

    loadData();
  }, []);

  return (
          <>   <div className="relative z-[9999]">
                   <AdminHeader />
              </div> 
     
    <div className="p-8 min-h-screen bg-neutral-950 text-white">
      <h1 className="text-3xl font-serif mb-6">Admin Dashboard</h1>

      {/* KPI SECTION */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-white/5">
          <p className="text-sm text-white/60">Leads</p>
          <p className="text-3xl font-bold">{leads.length}</p>
        </div>

        <div className="p-6 rounded-xl bg-white/5">
          <p className="text-sm text-white/60">Reservations</p>
          <p className="text-3xl font-bold">{reservations.length}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2 rounded ${
            activeTab === "leads" ? "bg-secondary text-black" : "bg-white/10"
          }`}
        >
          Leads
        </button>

        <button
          onClick={() => setActiveTab("reservations")}
          className={`px-4 py-2 rounded ${
            activeTab === "reservations"
              ? "bg-secondary text-black"
              : "bg-white/10"
          }`}
        >
          Reservations
        </button>
      </div>

      {/* TABLE */}
      {activeTab === "leads" ? (
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/60">
              <th className="py-2">Phone</th>
              <th>Intent</th>
              <th>Source</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-white/10">
                <td className="py-2">{lead.phone}</td>
                <td>{lead.intent}</td>
                <td>{lead.source}</td>
                <td>{new Date(lead.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/60">
              <th className="py-2">Name</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="py-2">{r.name}</td>
                <td>{r.phone}</td>
                <td>{r.date}</td>
                <td>{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
     </>
  
  );
};

export default Dashboard;
