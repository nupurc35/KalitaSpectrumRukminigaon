import React, { useState } from 'react';
import { Layout } from '@/components/crm/Layout';
import { Card, CardContent, CardHeader } from '@/components/crm/Card';
import { FollowUpModal } from '@/components/crm/FollowUpModal';
import {
    Phone,
    Search,
    Filter,
    MoreHorizontal,
    Calendar,
    Clock,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CRMLeads() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<string | null>(null);

    const leads = [
        { id: 1, name: 'Aniketh Sharma', phone: '+91 98765 43210', status: 'New', lastContact: 'Never', nextFollowUp: 'Today' },
        { id: 2, name: 'Priya Das', phone: '+91 87654 32109', status: 'Contacted', lastContact: '2h ago', nextFollowUp: 'Feb 16' },
        { id: 3, name: 'Rahul Verma', phone: '+91 76543 21098', status: 'Follow-Up', lastContact: '1d ago', nextFollowUp: 'Feb 15' },
        { id: 4, name: 'Sanjana Goel', phone: '+91 65432 10987', status: 'Closed Won', lastContact: '3d ago', nextFollowUp: 'None' },
        { id: 5, name: 'Karan Mehra', phone: '+91 54321 09876', status: 'Closed Lost', lastContact: '1w ago', nextFollowUp: 'None' },
    ];

    const followUpsDue = [
        { name: 'Aniketh Sharma', time: '10:30 AM' },
        { name: 'Sameer Khan', time: '12:00 PM' },
        { name: 'Rajesh Gupta', time: '02:30 PM' },
        { name: 'Vikram Singh', time: '04:00 PM' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'New': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Contacted': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'Follow-Up': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Closed Won': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Closed Lost': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-white/5 text-white/50 border-white/10';
        }
    };

    const openFollowUp = (name: string) => {
        setSelectedLead(name);
        setIsModalOpen(true);
    };

    return (
        <Layout title="Leads Management">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Table Section */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search leads by name or phone..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="flex-1 md:flex-none bg-white text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all">
                                + Add Lead
                            </button>
                        </div>
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Lead Info</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Last Contacted</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Next Follow-up</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => openFollowUp(lead.name)}>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-white group-hover:text-white transition-colors">{lead.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                                                        <Phone size={12} /> {lead.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide",
                                                    getStatusStyle(lead.status)
                                                )}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm text-white/60">{lead.lastContact}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm">
                                                    {lead.nextFollowUp === 'Today' ? (
                                                        <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                                                            <Clock size={14} /> Today
                                                        </span>
                                                    ) : (
                                                        <span className="text-white/60">{lead.nextFollowUp}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openFollowUp(lead.name); }}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                                                    >
                                                        <Calendar size={18} />
                                                    </button>
                                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                            <p>Showing 5 of 124 leads</p>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">Prev</button>
                                <button className="px-3 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">Next</button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Side Panel: Follow-Ups Due Today */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-amber-500">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-amber-500 flex items-center gap-2">
                                    <Clock size={18} />
                                    Due Today
                                </h3>
                                <span className="text-xs px-2 py-0.5 bg-amber-500/10 rounded-full">{followUpsDue.length}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 mt-4">
                                {followUpsDue.map((item, i) => (
                                    <div key={i} className="group p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 group-hover:text-white/50">{item.time}</span>
                                            <ChevronRight size={14} className="text-white/20 group-hover:text-white transform transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <div className="mt-4 flex gap-2">
                                            <button className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                                Snooze
                                            </button>
                                            <button className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                                                Call
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 text-xs text-white/50 hover:text-white transition-colors">
                                View Calendar <ExternalLink size={14} />
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <FollowUpModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                leadName={selectedLead || ''}
            />
        </Layout>
    );
}
