import React, { useEffect, useState } from "react";
import { fetchLeads, fetchReservations, updateLeadStatus, deleteLead } from "../../services/adminService";
import AdminHeader from "./adminNavbar";
import { supabase } from "@/lib/superbase";
import { Lead, Reservation } from "../../types";

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<"leads" | "reservations">("leads");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);



  const loadLeads = async (pageIdx = 0) => {
    try {
      setLoading(true);
      const { data } = await fetchLeads(pageIdx, 20);

      const normalizedLeads = (data || []).map((l: any) => ({
        ...l,
        status: l.status || "New"
      }));

      if (pageIdx === 0) {
        setLeads(normalizedLeads);
      } else {
        setLeads(prev => [...prev, ...normalizedLeads]);
      }

      setHasMore((data?.length || 0) === 20);
    } catch (error) {
      console.error("Failed to load leads", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadLeads(0);
      const { data: reservationData } = await fetchReservations();
      setReservations(reservationData || []);
    };
    loadData();
  }, []);

  const loadMoreLeads = async () => {
    const nextPage = page + 1;
    await loadLeads(nextPage);
    setPage(nextPage);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;

    try {
      const { error } = await deleteLead(id);
      if (error) throw error;

      // Refetch to ensure data consistency
      await loadLeads(0);
      setPage(0); // Reset pagination
    } catch (err) {
      console.error("Failed to delete lead", err);
      alert("Failed to delete lead. It may be protected or already removed.");
    }
  };

  const handleStatusUpdate = async (id: string) => {
    try {
      const { error } = await updateLeadStatus(id, "Contacted");
      if (error) throw error;

      // Refetch to ensure data consistency
      // We can just update the local item if we trust it, but user requested "Refetch leads"
      // However, refetching page 0 might reset the view if they are on page 5.
      // Better to optimistic update + background re-verify, OR just accept that for this simple apps
      // refetching current page or just ensuring the write succeeded is enough.
      // User requirement: "Refetch leads after successful mutations"
      await loadLeads(0);
      setPage(0);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <>
      <div className="relative z-[9999]">
        <AdminHeader />
      </div>

      <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <header className="mb-12">
            <h1 className="text-4xl font-serif text-white mb-2">Overview</h1>
            <p className="text-white/40">Welcome back to your control center.</p>
          </header>

          {/* KPI SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300">
              <p className="text-sm uppercase tracking-widest text-white/40 font-medium mb-2">Total Leads</p>
              <p className="text-5xl font-serif text-white group-hover:scale-105 transition-transform duration-300 origin-left">{leads.length}</p>
            </div>

            <div className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300">
              <p className="text-sm uppercase tracking-widest text-white/40 font-medium mb-2">Reservations</p>
              <p className="text-5xl font-serif text-white group-hover:scale-105 transition-transform duration-300 origin-left">{reservations.length}</p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-8 mb-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab("leads")}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "leads" ? "text-secondary" : "text-white/40 hover:text-white"
                }`}
            >
              Leads
              {activeTab === "leads" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("reservations")}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "reservations" ? "text-secondary" : "text-white/40 hover:text-white"
                }`}
            >
              Reservations
              {activeTab === "reservations" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
              )}
            </button>
          </div>

          {/* TABLE */}
          {/* TABLE */}
          <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
            {activeTab === "leads" ? (
              <>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Phone</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Intent</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Status</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Source</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Time</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6 font-mono text-sm text-white/80">{lead.phone}</td>
                        <td className="py-4 px-6 text-sm text-white/80">{lead.intent}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${(lead.status === "Contacted")
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-white/60">{lead.source}</td>
                        <td className="py-4 px-6 text-sm text-white/60">{new Date(lead.created_at).toLocaleString()}</td>
                        <td className="py-4 px-6 text-right">
                          {lead.status === "Contacted" ? (
                            <span className="text-xs font-medium text-white/30 italic">
                              Contacted
                            </span>
                          ) : (
                            <button
                              onClick={() => handleStatusUpdate(lead.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary text-black hover:bg-white transition-colors"
                            >
                              Mark Contacted
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="ml-3 text-white/20 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {hasMore && (
                  <div className="p-4 text-center border-t border-white/5">
                    <button
                      onClick={loadMoreLeads}
                      className="text-sm text-secondary hover:text-white transition-colors uppercase tracking-widest font-bold"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Name</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Phone</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Date</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-sm font-bold text-white/90">{r.name}</td>
                      <td className="py-4 px-6 font-mono text-sm text-white/80">{r.phone}</td>
                      <td className="py-4 px-6 text-sm text-white/80">{r.date}</td>
                      <td className="py-4 px-6 text-sm text-white/80">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
