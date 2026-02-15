import React from 'react';
import { Layout } from '@/components/crm/Layout';
import { Card, CardContent, CardHeader } from '@/components/crm/Card';
import {
    Users,
    MessageSquare,
    CalendarCheck,
    CheckCircle2,
    TrendingUp,
    Package,
    AlertCircle,
    Clock,
    ArrowUpRight
} from 'lucide-react';

export default function CRMDashboard() {
    const kpis = [
        { title: 'New Leads Today', value: '12', icon: Users, color: 'text-blue-500' },
        { title: 'Contacted Today', value: '08', icon: MessageSquare, color: 'text-purple-500' },
        { title: 'Reservations Created', value: '24', icon: CalendarCheck, color: 'text-amber-500' },
        { title: 'Completed Reservations', value: '18', icon: CheckCircle2, color: 'text-emerald-500' },
    ];

    const attentionItems = [
        { title: 'Overdue Follow-Ups', count: 3, accent: 'border-l-red-500', icon: AlertCircle },
        { title: 'Follow-Ups Due Today', count: 5, accent: 'border-l-yellow-500', icon: Clock },
        { title: 'Never Contacted 24h+', count: 7, accent: 'border-l-orange-500', icon: AlertCircle },
    ];

    const topItems = [
        { name: 'Tandoori Chicken', orders: 145, revenue: '₹42,000' },
        { name: 'Paneer Butter Masala', orders: 120, revenue: '₹36,000' },
        { name: 'Butter Naan', orders: 450, revenue: '₹18,000' },
    ];

    return (
        <Layout title="Overview">
            <div className="space-y-8">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, i) => (
                        <Card key={i}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-white/50">{kpi.title}</p>
                                    <kpi.icon size={20} className={kpi.color} />
                                </div>
                                <h3 className="text-2xl font-bold">{kpi.value}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Attention Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-white/70">
                        <AlertCircle size={18} />
                        <h2 className="text-lg font-medium">Needs Attention</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {attentionItems.map((item, i) => (
                            <Card key={i} className={`border-l-4 ${item.accent}`}>
                                <CardContent className="pt-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-white/50">{item.title}</p>
                                        <h3 className="text-2xl font-bold mt-1">{item.count}</h3>
                                    </div>
                                    <item.icon size={24} className="text-white/20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Charts Placeholder */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <TrendingUp size={18} />
                                        Revenue & Orders (Last 14 Days)
                                    </h3>
                                    <span className="text-xs text-white/40">Total Revenue: ₹4.2L</span>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[240px] flex items-end gap-2 px-10 pb-8">
                                {/* Simple CSS-based bar chart placeholder */}
                                {[40, 65, 45, 80, 55, 90, 70, 40, 60, 85, 50, 75, 95, 65].map((h, i) => (
                                    <div key={i} className="flex-1 space-y-1">
                                        <div className="bg-white/5 hover:bg-white/10 transition-colors w-full rounded-t-sm" style={{ height: `${h}%` }}></div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Menu Items */}
                    <Card>
                        <CardHeader>
                            <h3 className="font-semibold flex items-center gap-2">
                                <Package size={18} />
                                Top 3 Menu Items
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topItems.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">
                                                #{i + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-xs text-white/40">{item.orders} orders</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold">{item.revenue}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors flex items-center justify-center gap-2">
                                View Full Report <ArrowUpRight size={14} />
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
