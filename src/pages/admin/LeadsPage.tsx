import React, { useEffect, useState } from "react";
import { fetchLeads, updateLeadStatus, deleteLead, convertLeadToReservation, closeLeadAsLost } from "../../services/adminService";
import AdminHeader from "./adminNavbar";
import { Lead } from "../../types";

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
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
    loadLeads(0);
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
      await loadLeads(0);
      setPage(0);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleConvertToReservation = async (leadId: string) => {
    try {
      await convertLeadToReservation(leadId);

      // Refetch to ensure data consistency
      await loadLeads(0);
      setPage(0);
    } catch (err) {
      console.error("Failed to convert lead to reservation", err);
      alert("Failed to convert lead to reservation. Please try again.");
    }
  };

  const handleCloseLost = async (id: string) => {
    if (!window.confirm("Mark this lead as closed (lost)?")) return;

    try {
      await closeLeadAsLost(id);

      // Refetch to ensure data consistency
      await loadLeads(0);
      setPage(0);
    } catch (err) {
      console.error("Failed to close lead", err);
      alert("Failed to close lead. Please try again.");
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "contacted":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Reservation Created":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Closed Won":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Closed Lost":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "New":
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const isLeadClosed = (status: string) => status === "Closed Won" || status === "Closed Lost";

  return (
    <>
      <div className="relative z-[9999]">
        <AdminHeader />
      </div>

      <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <header className="mb-12">
            <h1 className="text-4xl font-serif text-white mb-2">Leads</h1>
            <p className="text-white/40">Manage and track your customer leads.</p>
          </header>

          {/* TABLE */}
          <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Phone</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Intent</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Source</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Time</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors group ${
                      isLeadClosed(lead.status) ? "opacity-60" : ""
                    }`}
                  >
                    <td className="py-4 px-6 font-mono text-sm text-white/80">{lead.phone}</td>
                    <td className="py-4 px-6 text-sm text-white/80">{lead.intent}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyles(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-white/60">{lead.source}</td>
                    <td className="py-4 px-6 text-sm text-white/60">{new Date(lead.created_at).toLocaleString()}</td>
                    <td className="py-4 px-6 text-right space-x-2 flex justify-end items-center">
                      {isLeadClosed(lead.status) ? (
                        <span className="text-xs font-medium text-white/40 italic">Closed</span>
                      ) : lead.status === "Reservation Created" ? (
                        <span className="text-xs font-medium text-white/30 italic">Converted</span>
                      ) : (
                        <>
                          {lead.status === "New" && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(lead.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary text-black hover:bg-white transition-colors"
                              >
                                Mark Contacted
                              </button>
                              <button
                                onClick={() => handleCloseLost(lead.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                              >
                                Close Lost
                              </button>
                            </>
                          )}
                          {lead.status === "Contacted" && (
                            <>
                              <button
                                onClick={() => handleConvertToReservation(lead.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                              >
                                Convert
                              </button>
                              <button
                                onClick={() => handleCloseLost(lead.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                              >
                                Close Lost
                              </button>
                            </>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-white/20 hover:text-red-400 transition-colors"
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
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadsPage;
