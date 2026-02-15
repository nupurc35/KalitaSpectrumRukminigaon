import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/superbase";
import AdminHeader from "./adminNavbar";
import AdminDashboardStats from "./AdminDashboardStats";
import { getTodayMetrics, TodayMetrics } from "@/services/todayMetricsService";
import { restaurantId } from "@/config/env";

// Load Today Metrics
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
  // Today Metrics State
  const [todayMetrics, setTodayMetrics] = useState<TodayMetrics | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [overdueFollowUps, setOverdueFollowUps] = useState(0);
  const [dueTodayFollowUps, setDueTodayFollowUps] = useState(0);
  const [neverContacted, setNeverContacted] = useState(0)

  useEffect(() => {
    let isMounted = true;
    setTodayLoading(true);
    getTodayMetrics()
      .then((metrics) => {
        if (isMounted) setTodayMetrics(metrics);
      })
      .catch((err) => {
        console.error("Failed to load today's metrics:", err);
        if (isMounted) setTodayMetrics(null);
      })
      .finally(() => {
        if (isMounted) setTodayLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);



  useEffect(() => {
    const loadFollowUpMetrics = async () => {
      const { data: overdueCount } = await supabase.rpc(
        "overdue_followups_count",
        { restaurant_id_param: restaurantId }
      );

      const { data: dueTodayCount } = await supabase.rpc(
        "followups_due_today_count",
        { restaurant_id_param: restaurantId }
      );

      setOverdueFollowUps(overdueCount ?? 0);
      setDueTodayFollowUps(dueTodayCount ?? 0);
    };

    loadFollowUpMetrics();
  }, []);








  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load Analytics (Last 14 Days)
  // -----------------------
  // -----------------------
  // Load Analytics (Last 14 Days)
  // -----------------------
  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setAnalyticsLoading(true);

      try {
        const fourteenDaysAgo = new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString();

        // Execute all queries in parallel
        const [topItemsResult, revenueResult, ordersResult] =
          await Promise.all([

            // 1️⃣ Top 3 Items (from SQL View)
            supabase
              .from("top_items_last_14_days")
              .select("*")
              .limit(3),

            // 2️⃣ Revenue (from SQL View)
            supabase
              .from("revenue_last_14_days")
              .select("total_revenue")
              .single(),

            // 3️⃣ Paid Orders Count (direct query)
            supabase
              .from("orders")
              .select("id", { count: "exact", head: true })
              .gte("created_at", fourteenDaysAgo)
              .eq("status", "paid"),
          ]);

        // Log errors individually (so one failure doesn’t hide others)
        if (topItemsResult.error) {
          console.error("Top items error:", topItemsResult.error);
        }

        if (revenueResult.error) {
          console.error("Revenue error:", revenueResult.error);
        }

        if (ordersResult.error) {
          console.error("Orders count error:", ordersResult.error);
        }

        // Update state safely
        if (isMounted) {
          setTopItems(topItemsResult.data ?? []);

          setTotalRevenue(
            revenueResult.data?.total_revenue
              ? Number(revenueResult.data.total_revenue)
              : 0
          );

          setTotalOrders(ordersResult.count ?? 0);

          setAnalyticsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected analytics error:", error);

        if (isMounted) {
          setTopItems([]);
          setTotalRevenue(0);
          setTotalOrders(0);
          setAnalyticsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);


  return (
    <>
      <div className="relative z-[9999]">
        <AdminHeader />
      </div>

      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-amber-500/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <header className="mb-12">
            <h1 className="text-3xl font-medium tracking-tight text-white mb-2">Overview</h1>
            <p className="text-white/40">Welcome back to your control center.</p>
          </header>


          {/* Today Overview Section */}
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-amber-500/50"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Today's Metrics</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* New Leads Today */}
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-6 hover:border-white/20 transition-all duration-300">
                <div className="relative z-10">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1 block">New Leads</span>
                  {todayLoading ? (
                    <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <span className="text-3xl font-medium text-white">{todayMetrics?.newLeads ?? "—"}</span>
                  )}
                </div>
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
              </div>

              {/* Contacted Today */}
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-6 hover:border-white/20 transition-all duration-300">
                <div className="relative z-10">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1 block">Contacted</span>
                  {todayLoading ? (
                    <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <span className="text-3xl font-medium text-white">{todayMetrics?.contactedToday ?? "—"}</span>
                  )}
                </div>
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
              </div>

              {/* Reservations Created Today */}
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-6 hover:border-white/20 transition-all duration-300">
                <div className="relative z-10">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1 block">Reservations</span>
                  {todayLoading ? (
                    <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <span className="text-3xl font-medium text-white">{todayMetrics?.reservationsCreated ?? "—"}</span>
                  )}
                </div>
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
              </div>

              {/* Completed Reservations Today */}
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-6 hover:border-white/20 transition-all duration-300">
                <div className="relative z-10">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1 block">Completed</span>
                  {todayLoading ? (
                    <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <span className="text-3xl font-medium text-white">{todayMetrics?.completedToday ?? "—"}</span>
                  )}
                </div>
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cancelled Reservations Today */}
              <div className="rounded-xl border border-white/5 bg-[#171717]/50 p-6 flex justify-between items-center group hover:bg-[#171717] transition-colors">
                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">Cancelled</span>
                  {todayLoading ? (
                    <div className="h-6 w-10 bg-white/5 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-xl font-medium text-white mt-1">{todayMetrics?.cancelledToday ?? "—"}</p>
                  )}
                </div>
              </div>
              {/* Lead → Reservation Conversion Rate */}
              <div className="rounded-xl border border-white/5 bg-[#171717]/50 p-6 flex justify-between items-center group hover:bg-[#171717] transition-colors">
                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">Lead Conversion</span>
                  {todayLoading ? (
                    <div className="h-6 w-16 bg-white/5 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-xl font-medium text-white mt-1">{todayMetrics ? `${todayMetrics.leadToReservationRate.toFixed(1)}%` : "—"}</p>
                  )}
                </div>
              </div>
              {/* Reservation → Completion Rate */}
              <div className="rounded-xl border border-white/5 bg-[#171717]/50 p-6 flex justify-between items-center group hover:bg-[#171717] transition-colors">
                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">Completion Rate</span>
                  {todayLoading ? (
                    <div className="h-6 w-16 bg-white/5 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-xl font-medium text-white mt-1">{todayMetrics ? `${todayMetrics.reservationToCompletionRate.toFixed(1)}%` : "—"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* End Today Overview */}

          {/*Leads that needs attention */}
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-red-500/50"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Attention Needed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-xl border-l-4 border-l-red-500 border-y border-r border-y-white/5 border-r-white/5 bg-[#171717] p-6 shadow-lg shadow-red-900/5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1 block">Overdue</span>
                    <span className="text-sm text-white/60">Follow-Ups</span>
                  </div>
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div>
                </div>
                <p className="text-3xl font-medium text-white mt-4">
                  {overdueFollowUps}
                </p>
              </div>

              <div className="rounded-xl border-l-4 border-l-amber-500 border-y border-r border-y-white/5 border-r-white/5 bg-[#171717] p-6 shadow-lg shadow-amber-900/5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1 block">Due Today</span>
                    <span className="text-sm text-white/60">Follow-Ups</span>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                </div>
                <p className="text-3xl font-medium text-white mt-4">
                  {dueTodayFollowUps}
                </p>
              </div>
            </div>
          </div>
          {/*End leads that needs attention*/}


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="rounded-2xl border border-white/10 bg-[#171717] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold">
                  Top Items (14D)
                </p>
                <svg xmlns="http://www.w3.org/2000/svg" className="text-white/20" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              </div>

              {analyticsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`top-item-skeleton-${index}`} className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-white/5 rounded" />
                      <div className="h-4 w-8 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              ) : topItems.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-white/40">No data available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white/50">
                          #{index + 1}
                        </div>
                        <span className="text-sm font-medium text-white/90">{item.name}</span>
                      </div>
                      <div className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white/70">{item.quantity} sold</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#171717] p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs uppercase tracking-widest text-white/40 font-bold">
                    Total Revenue (14D)
                  </p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-emerald-500/50" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                {analyticsLoading ? (
                  <div className="h-12 w-48 bg-white/10 rounded animate-pulse" />
                ) : totalRevenue === null ? (
                  <p className="text-4xl font-medium text-white/20">—</p>
                ) : (
                  <p className="text-4xl font-medium text-white tracking-tight">
                    ₹{totalRevenue.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-xs text-white/30">Gross revenue generated from paid orders in the last two weeks.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#171717] p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs uppercase tracking-widest text-white/40 font-bold">
                    Total Orders (14D)
                  </p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500/50" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                </div>
                {analyticsLoading ? (
                  <div className="h-12 w-32 bg-white/10 rounded animate-pulse" />
                ) : totalOrders === null ? (
                  <p className="text-4xl font-medium text-white/20">—</p>
                ) : (
                  <p className="text-4xl font-medium text-white tracking-tight">
                    {totalOrders.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-xs text-white/30">Total count of completed and paid transactions in the last two weeks.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 mb-8 border-b border-white/10">
            <button
              type="button"
              onClick={() => navigate("/admin/menu")}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${location.pathname.includes("/admin/menu")
                  ? "text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
            >
              Menu Items
              {location.pathname.includes("/admin/menu") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${location.pathname.includes("/admin/categories")
                  ? "text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
            >
              Categories
              {location.pathname.includes("/admin/categories") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/leads")}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${location.pathname.includes("/admin/leads")
                  ? "text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
            >
              Leads
              {location.pathname.includes("/admin/leads") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/reservations")}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${location.pathname.includes("/admin/reservations")
                  ? "text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
            >
              Reservations
              {location.pathname.includes("/admin/reservations") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
