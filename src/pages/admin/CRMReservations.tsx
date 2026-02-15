import React, { useEffect, useState } from "react";
import { fetchReservations, updateReservationStatus } from "../../services/adminService";
import { Reservation } from "../../types";
import { Layout } from "@/components/crm/Layout";
import { Card } from "@/components/crm/Card";
import {
    Calendar,
    Clock,
    Users,
    Phone,
    Search,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const CRMReservations: React.FC = () => {
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

    const getStatusBadgeStyles = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "confirmed":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "completed":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "cancelled":
                return "bg-red-500/10 text-red-500 border-red-500/20";
            default:
                return "bg-white/5 text-white/50 border-white/10";
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-500";
            case "confirmed": return "bg-blue-500";
            case "completed": return "bg-emerald-500";
            case "cancelled": return "bg-red-500";
            default: return "bg-white/50";
        }
    };

    return (
        <Layout title="Reservations">
            <div className="space-y-6">
                {/* Controls Section (Visual only, to match CRM style) */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search reservations..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                            <Filter size={16} /> Filter
                        </button>
                        <button className="flex-1 md:flex-none bg-white text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all">
                            + New Reservation
                        </button>
                    </div>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Guest Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Guests</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-white/40">Loading reservations...</td>
                                    </tr>
                                ) : reservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-white/40">No reservations found.</td>
                                    </tr>
                                ) : (
                                    reservations.map((r) => (
                                        <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-5">
                                                <span className="font-medium text-white block group-hover:text-white transition-colors">
                                                    {r.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm text-white/60">
                                                    <Phone size={14} className="text-white/30" />
                                                    <span className="font-mono">{r.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                                        <Calendar size={14} className="text-white/30" />
                                                        <span>{r.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                                        <Clock size={14} className="text-white/30" />
                                                        <span>{r.time}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm text-white/70">
                                                    <Users size={14} className="text-white/30" />
                                                    <span>{r.guests || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide",
                                                    getStatusBadgeStyles(r.status)
                                                )}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusDotColor(r.status)}`}></span>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {r.status === "pending" ? (
                                                    <select
                                                        onChange={(e) => handleReservationStatusUpdate(r.id, e.target.value as "confirmed" | "cancelled")}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#262626] text-white border border-white/10 hover:border-white/20 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Action</option>
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
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#262626] text-white border border-white/10 hover:border-white/20 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Action</option>
                                                        <option value="completed">Complete</option>
                                                        <option value="cancelled">Cancel</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-xs font-medium text-white/30 italic">
                                                        {r.status === "completed" ? "Closed" : "Voided"}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default CRMReservations;
