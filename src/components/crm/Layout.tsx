import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    title: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Sidebar />

            <main className="transition-all duration-300 lg:pl-64">
                {/* We adjust padding dynamically based on sidebar state if needed, but for now 64 works for both */}
                <div className="max-w-[1248px] mx-auto px-6 py-10">
                    <header className="mb-10">
                        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                    </header>

                    {children}
                </div>
            </main>
        </div>
    );
};
