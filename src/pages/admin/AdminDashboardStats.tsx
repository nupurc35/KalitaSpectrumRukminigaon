import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/superbase";

type TopMenuItem = {
  id: string;
  name: string | null;
  sales_last_14_days: number | null;
};

type StatsState = {
  menuCount: number;
  reservationCount: number;
  confirmedReservationCount: number;
  leadCount: number;
  topMenuItem: TopMenuItem | null;
};

const emptyStats: StatsState = {
  menuCount: 0,
  reservationCount: 0,
  confirmedReservationCount: 0,
  leadCount: 0,
  topMenuItem: null,
};

const AdminDashboardStats: React.FC = () => {
  const [stats, setStats] = useState<StatsState>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);

      const [
        menuCountResult,
        reservationCountResult,
        confirmedCountResult,
        leadCountResult,
        topMenuItemResult,
      ] = await Promise.all([
        supabase.from("menu_items").select("id", { count: "exact", head: true }),
        supabase.from("reservations").select("id", { count: "exact", head: true }),
        supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("status", "confirmed"),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase
          .from("menu_items")
          .select("id,name,sales_last_14_days")
          .order("sales_last_14_days", { ascending: false })
          .limit(1),
      ]);

      const errors = [
        menuCountResult.error,
        reservationCountResult.error,
        confirmedCountResult.error,
        leadCountResult.error,
        topMenuItemResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error("Failed to load dashboard stats:", errors);
      }

      const nextStats: StatsState = {
        menuCount: menuCountResult.count ?? 0,
        reservationCount: reservationCountResult.count ?? 0,
        confirmedReservationCount: confirmedCountResult.count ?? 0,
        leadCount: leadCountResult.count ?? 0,
        topMenuItem: (topMenuItemResult.data?.[0] as TopMenuItem | undefined) ?? null,
      };

      if (isMounted) {
        setStats(nextStats);
        setLoading(false);
      }
    };

    loadStats().catch((err) => {
      console.error("Failed to load dashboard stats:", err);
      if (isMounted) {
        setStats(emptyStats);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Menu Items",
        value: stats.menuCount.toLocaleString(),
        subtitle: "Total items",
      },
      {
        label: "Reservations",
        value: stats.reservationCount.toLocaleString(),
        subtitle: `${stats.confirmedReservationCount.toLocaleString()} confirmed`,
      },
      {
        label: "Leads",
        value: stats.leadCount.toLocaleString(),
        subtitle: "Total leads",
      },
      {
        label: "Top Item (14d)",
        value: stats.topMenuItem?.name ?? "—",
        subtitle: `${(stats.topMenuItem?.sales_last_14_days ?? 0).toLocaleString()} sales`,
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`stat-skeleton-${index}`}
            className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
          >
            <div className="h-3 w-24 bg-white/10 rounded mb-4" />
            <div className="h-8 w-32 bg-white/10 rounded mb-2" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300"
        >
          <p className="text-sm uppercase tracking-widest text-white/40 font-medium mb-3">
            {card.label}
          </p>
          <p className="text-3xl font-serif text-white mb-2">{card.value}</p>
          <p className="text-xs uppercase tracking-widest text-white/40">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboardStats;
