import React, { useEffect, useState } from "react";
import { fetchReservations, updateReservationStatus } from "../../services/adminService";
import AdminHeader from "./adminNavbar";
import { Reservation } from "../../types";

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        const { data } = await fetchReservations();
        setReservations(data || []);
      } catch (error) {
        console.error("Failed to load reservations", error);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  const handleReservationStatusUpdate = async (
    id: string,
    newStatus: "confirmed"|"completed" | "cancelled"
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
            <h1 className="text-4xl font-serif text-white mb-2">Reservations</h1>
            <p className="text-white/40">Manage and track your customer reservations.</p>
          </header>

          {/* TABLE */}
          <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
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
                  <td className="py-4 px-6 text-sm text-white/80">{r.guests || "-"}</td>
                {/* STATUS COLUMN */}
                   <td className="py-4 px-6">
                   <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                         r.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20": r.status === "confirmed"? "bg-blue-500/10 text-blue-400 border-blue-500/20": r.status === "completed"
                                       ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {r.status}
                    </span>
                   </td>
                {/* ACTION COLUMN */}
                 <td className="py-4 px-6 text-right">
                     {r.status === "pending" ? (
                 <select onChange={(e) =>handleReservationStatusUpdate(r.id,e.target.value as "confirmed" | "cancelled")}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              Select Action
            </option>
            <option value="confirmed">Confirm</option>
            <option value="cancelled">Cancel</option>
          </select>
        ) : r.status === "confirmed" ? (
          <select
            onChange={(e) =>
              handleReservationStatusUpdate(
                r.id,
                e.target.value as "completed" | "cancelled"
              )
            }
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              Select Action
            </option>
            <option value="completed">Complete</option>
            <option value="cancelled">Cancel</option>
          </select>
        ) : (
          <span className="text-xs font-medium text-white/40 italic">
            {r.status === "completed" ? "Completed" : "Cancelled"}
          </span>
        )}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationsPage;
