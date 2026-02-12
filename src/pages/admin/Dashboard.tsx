import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/superbase";
import AdminHeader from "./adminNavbar";
import AdminDashboardStats from "./AdminDashboardStats";
import { getTodayMetrics, TodayMetrics } from "@/services/todayMetricsService";

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

      <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <header className="mb-12">
            <h1 className="text-4xl font-serif text-white mb-2">Overview</h1>
            <p className="text-white/40">Welcome back to your control center.</p>
          </header>


          {/* Today Overview Section */}
          <div className="mb-12">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">Today</span>
              <span className="text-xs text-white/40">Overview</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* New Leads Today */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-start">
                <span className="text-xs text-white/40 mb-1">New Leads</span>
                {todayLoading ? (
                  <div className="h-7 w-12 bg-white/10 rounded" />
                ) : (
                  <span className="text-2xl font-serif text-white">{todayMetrics?.newLeads ?? "—"}</span>
                )}
              </div>
              {/* Contacted Today */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-start">
                <span className="text-xs text-white/40 mb-1">Contacted</span>
                {todayLoading ? (
                  <div className="h-7 w-12 bg-white/10 rounded" />
                ) : (
                  <span className="text-2xl font-serif text-white">{todayMetrics?.contactedToday ?? "—"}</span>
                )}
              </div>
              {/* Reservations Created Today */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-start">
                <span className="text-xs text-white/40 mb-1">Reservations</span>
                {todayLoading ? (
                  <div className="h-7 w-12 bg-white/10 rounded" />
                ) : (
                  <span className="text-2xl font-serif text-white">{todayMetrics?.reservationsCreated ?? "—"}</span>
                )}
              </div>
              {/* Completed Reservations Today */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-start">
                <span className="text-xs text-white/40 mb-1">Completed</span>
                {todayLoading ? (
                  <div className="h-7 w-12 bg-white/10 rounded" />
                ) : (
                  <span className="text-2xl font-serif text-white">{todayMetrics?.completedToday ?? "—"}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Cancelled Reservations Today */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-start">
                <span className="text-xs text-white/40 mb-1">Cancelled</span>
                {todayLoading ? (
                  <div className="h-7 w-12 bg-white/10 rounded" />
                ) : (
                  <span className="text-2xl font-serif text-white">{todayMetrics?.cancelledToday ?? "—"}</span>
                )}
              </div>
              {/* Lead → Reservation Conversion Rate */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-start">
                <span className="text-xs text-white/40 mb-1">Lead → Reservation Rate</span>
                {todayLoading ? (
                  <div className="h-7 w-20 bg-white/10 rounded" />
                ) : (
                  <span className="text-2xl font-serif text-white">{todayMetrics ? `${todayMetrics.leadToReservationRate.toFixed(1)}%` : "—"}</span>
                )}
              </div>
              {/* Reservation → Completion Rate */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-start">
                <span className="text-xs text-white/40 mb-1">Reservation → Completion Rate</span>
                {todayLoading ? (
                  <div className="h-7 w-20 bg-white/10 rounded" />
                ) : (
                  <span className="text-2xl font-serif text-white">{todayMetrics ? `${todayMetrics.reservationToCompletionRate.toFixed(1)}%` : "—"}</span>
                )}
              </div>
            </div>
          </div>
          {/* End Today Overview */}

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
            <button
              type="button"
              onClick={() => navigate("/admin/leads")}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                location.pathname.includes("/admin/leads")
                  ? "text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Leads
              {location.pathname.includes("/admin/leads") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/reservations")}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                location.pathname.includes("/admin/reservations")
                  ? "text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Reservations
              {location.pathname.includes("/admin/reservations") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
