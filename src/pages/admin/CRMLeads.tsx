import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/crm/Layout';
import { Card, CardContent, CardHeader } from '@/components/crm/Card';
import {
    Phone,
    Search,
    Filter,
    MoreHorizontal,
    Loader2,
    AlertCircle,
    RefreshCw,
    Clock,
    ExternalLink,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getCRMLeads,
    getCRMLeadsCount,
    searchLeadsByPhone,
    markContacted,
    closeLeadAsLost,
    convertLeadToReservation,
    CRMLead
} from '@/services/leadService';
import { supabase } from '@/lib/superbase';
import { restaurantId } from '@/config/env';

export default function CRMLeads() {
    // Data states
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const PAGE_SIZE = 20;

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            await Promise.all([
                loadLeads(0),
                loadTotalCount()
            ]);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load leads. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const loadLeads = async (pageNum: number) => {
        const data = await getCRMLeads(pageNum, PAGE_SIZE);
        setLeads(data);
        setPage(pageNum);
    };

    const loadTotalCount = async () => {
        const count = await getCRMLeadsCount();
        setTotalCount(count);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            await loadLeads(0);
            return;
        }

        try {
            setLoading(true);
            const results = await searchLeadsByPhone(query);
            setLeads(results);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkContacted = async (leadId: string) => {
        try {
            setActionLoading(leadId);
            await markContacted(leadId);
            await loadLeads(page);
        } catch (err) {
            console.error('Failed to mark as contacted:', err);
            alert(err instanceof Error ? err.message : 'Failed to update lead.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleConvert = async (leadId: string) => {
        // Ask user for optional reservation details
        const confirmConvert = window.confirm(
            'Convert this lead to a reservation?\n\n' +
            'This will create a reservation with default values:\n' +
            '• Date: Today\n' +
            '• Time: 7:00 PM\n' +
            '• Guests: 2'
        );
        
        if (!confirmConvert) return;

        try {
            setActionLoading(leadId);
            
            // Use the Edge Function to convert the lead
            const { data, error } = await supabase.functions.invoke('crm-handler', {
                body: {
                    action: 'convert_lead',
                    payload: {
                        lead_id: leadId,
                        restaurant_id: restaurantId,
                        // Optional: you can prompt for these or leave them as defaults
                        // date: new Date().toISOString().split('T')[0],
                        // time: '19:00',
                        // guests: 2
                    }
                }
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error || 'Failed to convert lead');

            await loadLeads(page);
            alert('Lead converted to reservation successfully!');
        } catch (err) {
            console.error('Failed to convert lead:', err);
            alert(err instanceof Error ? err.message : 'Failed to convert lead.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCloseLost = async (leadId: string) => {
        if (!window.confirm('Mark this lead as closed (lost)?')) return;

        try {
            setActionLoading(leadId);
            await closeLeadAsLost(leadId);
            await loadLeads(page);
        } catch (err) {
            console.error('Failed to close lead:', err);
            alert(err instanceof Error ? err.message : 'Failed to close lead.');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusStyle = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        switch (normalizedStatus) {
            case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'contacted': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'follow-up': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'closed-won':
            case 'closed won':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'closed-lost':
            case 'closed lost':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-white/5 text-white/50 border-white/10';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleNextPage = () => {
        if ((page + 1) * PAGE_SIZE < totalCount) {
            loadLeads(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            loadLeads(page - 1);
        }
    };

    // Loading state
    if (loading && leads.length === 0) {
        return (
            <Layout title="Leads Management">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/40" />
                        <p className="text-white/60">Loading leads...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Error state
    if (error && leads.length === 0) {
        return (
            <Layout title="Leads Management">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                        <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                        <p className="text-white/60">{error}</p>
                        <button
                            onClick={loadInitialData}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

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
                                placeholder="Search leads by phone..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={loadInitialData}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
                            >
                                <RefreshCw size={16} /> Refresh
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                                <Filter size={16} /> Filter
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
                                        <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Source</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leads.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                                                {searchQuery ? 'No leads found matching your search.' : 'No leads yet.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        leads.map((lead) => (
                                            <tr
                                                key={lead.id}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-white text-sm">
                                                            {lead.name || lead.phone}
                                                        </p>
                                                        {lead.name && (
                                                            <p className="text-xs text-white/50 font-mono">
                                                                {lead.phone}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-1.5 text-xs text-white/40">
                                                                <Phone size={12} /> {lead.intent}
                                                            </div>
                                                            {lead.message && (
                                                                <button
                                                                    onClick={() => alert(lead.message)}
                                                                    title="View Message"
                                                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                                                >
                                                                    <MessageSquare size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide",
                                                        getStatusStyle(lead.status)
                                                    )}>
                                                        {lead.status.replace('-', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm text-white/60 capitalize">
                                                        {lead.source.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm text-white/60">
                                                        {formatTimestamp(lead.created_at)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {actionLoading === lead.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                                                        ) : lead.status.toLowerCase() === 'new' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleMarkContacted(lead.id)}
                                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                                                                >
                                                                    Contact
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCloseLost(lead.id)}
                                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                                                    title="Close Lost"
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>
                                                            </>
                                                        ) : lead.status.toLowerCase() === 'contacted' || lead.status.toLowerCase() === 'follow-up' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleConvert(lead.id)}
                                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                                                                >
                                                                    Convert
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCloseLost(lead.id)}
                                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                                                    title="Close Lost"
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-white/30 italic">Closed</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                            <p>Showing {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} leads</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 0}
                                    className="px-3 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={(page + 1) * PAGE_SIZE >= totalCount}
                                    className="px-3 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Side Panel: Info Card (replaces follow-ups) */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-blue-500 flex items-center gap-2">
                                    <Clock size={18} />
                                    Quick Stats
                                </h3>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 mt-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-xs text-white/40 mb-1">Total Leads</p>
                                    <p className="text-2xl font-bold">{totalCount}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-xs text-white/40 mb-1">Current Page</p>
                                    <p className="text-2xl font-bold">{page + 1}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-xs text-white/40 mb-1">Showing</p>
                                    <p className="text-lg font-semibold">{leads.length} leads</p>
                                </div>
                            </div>
                            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <p className="text-xs text-amber-400 font-medium">
                                    💡 Want follow-up tracking? Run the database migration to enable this feature.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}