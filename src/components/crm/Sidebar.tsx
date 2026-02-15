import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    UtensilsCrossed,
    FolderTree,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/admin/crm', icon: LayoutDashboard },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Leads', path: '/admin/crm/leads', icon: Users },
        { name: 'Reservations', path: '/admin/crm/reservations', icon: CalendarCheck },
        { name: 'Menu Items', path: '/admin/menu', icon: UtensilsCrossed },
        { name: 'Categories', path: '/admin/categories', icon: FolderTree },
        { name: 'Create Order', path: '/admin/create-order', icon: ShoppingCart },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 bg-crm-card border border-white/10 rounded-md text-white"
                >
                    {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full bg-[#0d0d0d] border-r border-white/10 z-50 transition-all duration-300",
                    isCollapsed ? "w-16" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="p-6 flex items-center justify-between">
                    {!isCollapsed && <h1 className="text-xl font-bold tracking-tight text-white">CRM</h1>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:block p-1 hover:bg-white/5 rounded transition-colors text-white/50"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="mt-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                )
                            }
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <item.icon size={20} className={cn("shrink-0", isCollapsed ? "mx-auto" : "mr-3")} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};
