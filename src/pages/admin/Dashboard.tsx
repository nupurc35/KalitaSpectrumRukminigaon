import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchLeads, fetchReservations, updateLeadStatus, deleteLead, updateReservationStatus } from "../../services/adminService";
import AdminHeader from "./adminNavbar";
import { Lead, Reservation } from "../../types";
import AdminDashboardStats from "./AdminDashboardStats";
import { supabase } from "@/lib/superbase";

type TopItem = {
  name: string;
  quantity: number;
};

type TopItemRow = {
  menu_item_id: string | null;
  quantity_sum: number | null;
  menu_items: { name: string | null } | null;
};

type RevenueRow = {
  quantity: number | null;
  price_at_time: number | null;
};

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<"leads" | "reservations">("leads");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);



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

  useEffect(() => {
    let isMounted = true;
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const loadAnalytics = async () => {
      setAnalyticsLoading(true);

      const [topItemsResult, revenueResult, ordersResult] = await Promise.all([
        supabase
          .from("order_items")
          .select("menu_item_id, quantity.sum(), menu_items ( name ), orders!inner ( created_at )")
          .gte("orders.created_at", fourteenDaysAgo)
          .order("quantity_sum", { ascending: false })
          .limit(3),
        supabase
          .from("order_items")
          .select("quantity, price_at_time, orders!inner ( created_at, status )")
          .gte("orders.created_at", fourteenDaysAgo)
          .eq("orders.status", "paid"),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .gte("created_at", fourteenDaysAgo)
          .eq("status", "paid"),
      ]);

      if (topItemsResult.error) {
        console.error("Failed to load top items:", topItemsResult.error);
      }
      if (revenueResult.error) {
        console.error("Failed to load revenue data:", revenueResult.error);
      }
      if (ordersResult.error) {
        console.error("Failed to load orders count:", ordersResult.error);
      }

      const topItemsRows = (topItemsResult.data ?? []) as TopItemRow[];
      const nextTopItems = topItemsRows.map((row) => ({
          name: row.menu_items?.name ?? "Unnamed Item",
          quantity: Number(row.quantity_sum ?? 0),
        }));

      const revenueRows = (revenueResult.data ?? []) as RevenueRow[];
      const nextRevenue = revenueRows.reduce((sum, row) => {
        const quantity = Number(row.quantity ?? 0);
        const price = Number(row.price_at_time ?? 0);
        return sum + quantity * price;
      }, 0);

      if (isMounted) {
        setTopItems(topItemsResult.error ? [] : nextTopItems);
        setTotalRevenue(revenueResult.error ? null : nextRevenue);
        setTotalOrders(ordersResult.error ? null : ordersResult.count ?? 0);
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics().catch((err) => {
      console.error("Failed to load analytics data:", err);
      if (isMounted) {
        setTopItems([]);
        setTotalRevenue(null);
        setTotalOrders(null);
        setAnalyticsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
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

  const handleReservationStatusUpdate = async (
    id: string,
    newStatus: "confirmed" | "completed" | "cancelled"
  ) => {
    try {
      // Find current reservation to check current status
      const currentReservation = reservations.find(r => r.id === id);

      if (!currentReservation) {
        alert("Reservation not found.");
        return;
      }

      // Enforce status transition rules
      if (currentReservation.status === "completed" || currentReservation.status === "cancelled") {
        alert("Cannot modify completed or cancelled reservations.");
        return;
      }

      const { error } = await updateReservationStatus(id, newStatus);
      if (error) throw error;

      // Refetch reservations to ensure data consistency
      const { data: reservationData } = await fetchReservations();
      setReservations(reservationData || []);
    } catch (err) {
      console.error("Failed to update reservation status", err);
      alert("Failed to update reservation status. Please try again.");
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

          <div className="mb-12">
            <AdminDashboardStats />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs uppercase tracking-widest text-white/40 font-medium mb-4">
                Top 3 Items (Last 14 Days)
              </p>
              {analyticsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`top-item-skeleton-${index}`} className="h-4 bg-white/10 rounded" />
                  ))}
                </div>
              ) : topItems.length === 0 ? (
                <p className="text-sm text-white/40">No data available.</p>
              ) : (
                <div className="space-y-3">
                  {topItems.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm text-white/80">{item.name}</span>
                      <span className="text-sm text-white/60">{item.quantity} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs uppercase tracking-widest text-white/40 font-medium mb-4">
                Total Revenue (14D)
              </p>
              {analyticsLoading ? (
                <div className="h-9 w-32 bg-white/10 rounded" />
              ) : totalRevenue === null ? (
                <p className="text-3xl font-serif text-white/40">—</p>
              ) : (
                <p className="text-3xl font-serif text-white">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs uppercase tracking-widest text-white/40 font-medium mb-4">
                Total Orders (14D)
              </p>
              {analyticsLoading ? (
                <div className="h-9 w-24 bg-white/10 rounded" />
              ) : totalOrders === null ? (
                <p className="text-3xl font-serif text-white/40">—</p>
              ) : (
                <p className="text-3xl font-serif text-white">
                  {totalOrders.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-8 mb-8 border-b border-white/10">
            <button
              type="button"
              onClick={() => navigate("/admin/menu")}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                location.pathname.includes("/admin/menu")
                  ? "text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Menu Items
              {location.pathname.includes("/admin/menu") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                location.pathname.includes("/admin/categories")
                  ? "text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Categories
              {location.pathname.includes("/admin/categories") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
              )}
            </button>
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
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Guests</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-sm font-bold text-white/90">{r.name}</td>
                      <td className="py-4 px-6 font-mono text-sm text-white/80">{r.phone}</td>
                      <td className="py-4 px-6 text-sm text-white/80">{r.date}</td>
                      <td className="py-4 px-6 text-sm text-white/80">{r.time}</td>
                      <td className="py-4 px-6 text-sm text-white/80">{r.guests || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${r.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            r.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {r.status === 'confirmed' ? (
                          <select
                            value={r.status}
                            onChange={(e) => handleReservationStatusUpdate(r.id, e.target.value as any)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className="text-xs font-medium text-white/30 italic">
                            {r.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </span>
                        )}
                      </td>
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
