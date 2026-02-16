import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/crm/Layout';
import { Card, CardContent, CardHeader } from '@/components/crm/Card';
import { Users, MessageSquare, CalendarCheck, CheckCircle2, AlertCircle, Clock, ArrowUpRight, Loader2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDashboardMetrics, getAttentionLeads, getRecentActivity, DashboardMetrics, AttentionLead, RecentActivity } from '@/services/dashboardService';
import { useRequireAuth } from '@/hooks/useAuth';
export default function CRMDashboard() {
    
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [attentionData, setAttentionData] = useState<{
        overdue: AttentionLead[];
        today: AttentionLead[];
        never: AttentionLead[];
    } | null>(null);
    
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'never'>('overdue');
    const [loading, setLoading] = useState(true);

useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                const [m, a, r] = await Promise.all([
                    getDashboardMetrics(), 
                    getAttentionLeads(),
                    getRecentActivity()
                ]);
                setMetrics(m);
                setAttentionData(a);
                // ✅ FIX 2: Use the state setter defined above
                setRecentActivity(r); 
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, []);

    const currentList = attentionData ? attentionData[activeTab] || [] : [];

    if (loading) return (
        <Layout title="Dashboard">
            <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
        </Layout>
    );

    return (
        <Layout title="Dashboard">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="New Leads Today" value={metrics?.newLeadsToday} icon={<Users />} />
                    <KPICard title="Contacted Today" value={metrics?.contactedToday} icon={<MessageSquare />} />
                    <KPICard title="Reservations" value={metrics?.reservationsCreated} icon={<CalendarCheck />} />
                    <KPICard title="Completed" value={metrics?.completedReservations} icon={<CheckCircle2 />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={18} className="text-amber-500" />
                                <h3 className="font-semibold text-xs uppercase tracking-wider">Needs Attention</h3>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex border-b border-white/10 mb-4">
                                {['overdue', 'today', 'never'].map((id) => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id as any)}
                                        className={cn(
                                            "flex-1 py-3 text-[10px] font-bold transition-all border-b-2",
                                            activeTab === id ? "border-amber-500 text-amber-500" : "border-transparent text-white/40"
                                        )}
                                    >
                                        {id === 'overdue' ? `Overdue (${metrics?.overdueFollowUps})` :
                                            id === 'today' ? `Due Today (${metrics?.followUpsDueToday})` :
                                                `Never (${metrics?.neverContacted24h})`}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2 min-h-[300px]">
                                {currentList.length > 0 ? currentList.map((lead) => (
                                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-white/5 group-hover:text-amber-500"><Phone size={14} /></div>
                                            <div>
                                                <p className="text-sm font-medium">{lead.phone}</p>
                                                <p className="text-[10px] text-white/40">
                                                    {activeTab === 'never'
                                                        ? `Added: ${new Date(lead.created_at).toLocaleDateString('en-IN')}`
                                                        : `Follow-up: ${lead.next_follow_up}`}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="p-1.5 rounded bg-white/5 text-white/40 hover:bg-amber-500 hover:text-black transition-all"><ArrowUpRight size={14} /></button>
                                    </div>
                                )) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-white/10 italic text-xs">No records found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader><h3 className="font-semibold">Recent Activity</h3></CardHeader>

                        <CardContent>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                            <div className="mt-1 p-2 rounded-full bg-blue-500/10 text-blue-500 h-fit">
                                                <MessageSquare size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white/80">
                                                    Contacted lead: <span className="font-bold text-white">{activity.leads?.phone || 'Unknown'}</span>
                                                </p>
                                                <p className="text-xs text-white/40 mt-1">
                                                    {new Date(activity.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-white/20 italic">
                                        No recent activity found.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}

function KPICard({ title, value, icon }: any) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</p>
                        <h3 className="text-2xl font-bold mt-1">{value || 0}</h3>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}