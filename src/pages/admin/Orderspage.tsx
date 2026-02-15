import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/crm/Layout';
import { Card, CardContent, CardHeader } from '@/components/crm/Card';
import { supabase } from '@/lib/superbase';
import { restaurantId } from '@/config/env';
import {
    Search,
    Filter,
    Eye,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    Package,
    TrendingUp,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'react-hot-toast';

type Order = {
    id: string;
    customer_name: string | null;
    table_number: string | null;
    total_amount: number | null;
    status: string | null;
    created_at: string;
    order_items: Array<{
        id: string;
        quantity: number;
        price_at_time: number;
        menu_items: {
            id: string;
            name: string;
        } | null;
    }>;
};

type OrderStats = {
    today: number;
    pending: number;
    completed: number;
    todayRevenue: number;
};

const CURRENT_RESTAURANT_ID = restaurantId;

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<OrderStats>({
        today: 0,
        pending: 0,
        completed: 0,
        todayRevenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        loadOrders();
        loadStats();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    customer_name,
                    table_number,
                    total_amount,
                    status,
                    created_at,
                    order_items (
                        id,
                        quantity,
                        price_at_time,
                        menu_items (
                            id,
                            name
                        )
                    )
                `)
                .eq('restaurant_id', CURRENT_RESTAURANT_ID)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders((data || []) as Order[]);
        } catch (err: any) {
            console.error('Failed to load orders:', err);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at')
                .eq('restaurant_id', CURRENT_RESTAURANT_ID)
                .gte('created_at', today.toISOString());

            if (error) throw error;

            const todayOrders = data || [];
            setStats({
                today: todayOrders.length,
                pending: todayOrders.filter(o => o.status === 'pending').length,
                completed: todayOrders.filter(o => o.status === 'completed').length,
                todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
            });
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)
                .eq('restaurant_id', CURRENT_RESTAURANT_ID);

            if (error) throw error;

            toast.success(`Order marked as ${newStatus}`);
            await loadOrders();
            await loadStats();
        } catch (err: any) {
            console.error('Failed to update order:', err);
            toast.error(err.message || 'Failed to update order');
        }
    };

    const getStatusStyle = (status: string | null) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'preparing':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'ready':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'cancelled':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-white/5 text-white/50 border-white/10';
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch = !searchQuery || 
            order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.table_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const viewOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    if (loading) {
        return (
            <Layout title="Orders">
                <div className="flex items-center justify-center h-64">
                    <div className="text-white/40 animate-pulse">Loading orders...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Orders">
            <Toaster position="top-center" />

            <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-white/50">Orders Today</p>
                                <Package size={20} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold">{stats.today}</h3>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-white/50">Pending</p>
                                <Clock size={20} className="text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-bold">{stats.pending}</h3>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-white/50">Completed</p>
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold">{stats.completed}</h3>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-white/50">Today's Revenue</p>
                                <TrendingUp size={20} className="text-purple-500" />
                            </div>
                            <h3 className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</h3>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by customer, table, or order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm"
                        />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all appearance-none"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-white/30 text-sm">
                                            {searchQuery || statusFilter !== 'all'
                                                ? 'No orders match your filters.'
                                                : 'No orders yet. Create your first order!'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-mono text-white/60">
                                                    #{order.id.slice(0, 8)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {order.customer_name || 'Walk-in'}
                                                    </p>
                                                    {order.table_number && (
                                                        <p className="text-xs text-white/40 mt-0.5">
                                                            Table {order.table_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-white/80">
                                                    {order.order_items?.length || 0} items
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-mono font-semibold text-white">
                                                    ₹{order.total_amount?.toFixed(2) || '0.00'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span
                                                    className={cn(
                                                        'px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide',
                                                        getStatusStyle(order.status)
                                                    )}
                                                >
                                                    {order.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs text-white/60">
                                                    {new Date(order.created_at).toLocaleString('en-IN', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => viewOrderDetails(order)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                                                        title="View details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <div className="relative group/menu">
                                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                                                            <MoreHorizontal size={18} />
                                                        </button>
                                                        <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors first:rounded-t-xl"
                                                            >
                                                                Mark as Preparing
                                                            </button>
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                                                            >
                                                                Mark as Ready
                                                            </button>
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors text-emerald-500"
                                                            >
                                                                Mark as Completed
                                                            </button>
                                                            <button
                                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors text-red-400 last:rounded-b-xl"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                        <p>Showing {filteredOrders.length} of {orders.length} orders</p>
                    </div>
                </Card>
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 z-[99999]">
                    <div className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">Order Details</h2>
                                <p className="text-xs text-white/40 mt-1 font-mono">
                                    #{selectedOrder.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-white/40 mb-1">Customer</p>
                                    <p className="text-sm font-medium">
                                        {selectedOrder.customer_name || 'Walk-in'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/40 mb-1">Table</p>
                                    <p className="text-sm font-medium">
                                        {selectedOrder.table_number || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/40 mb-1">Status</p>
                                    <span
                                        className={cn(
                                            'inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide',
                                            getStatusStyle(selectedOrder.status)
                                        )}
                                    >
                                        {selectedOrder.status || 'pending'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-white/40 mb-1">Time</p>
                                    <p className="text-sm font-medium">
                                        {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <p className="text-xs text-white/40 mb-3">Order Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.order_items?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.menu_items?.name || 'Unknown Item'}
                                                </p>
                                                <p className="text-xs text-white/40">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-mono font-semibold">
                                                ₹{(item.price_at_time * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-medium text-white/50">Total Amount</p>
                                    <p className="text-2xl font-bold font-mono">
                                        ₹{selectedOrder.total_amount?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}