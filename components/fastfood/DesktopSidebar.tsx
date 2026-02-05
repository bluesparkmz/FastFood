'use client';

import React from 'react';
import { Home, Search, ShoppingBag, User, Bell, Utensils, QrCode, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

const DesktopSidebar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Search, label: 'Busca', path: '/search' },
        { icon: ShoppingBag, label: 'Pedidos', path: '/orders' },
        { icon: Bell, label: 'Alertas', path: '/notifications' },
        { icon: User, label: 'Perfil', path: '/profile' },
    ];

    if (
        pathname?.startsWith('/restaurantes') ||
        pathname === '/help' ||
        pathname === '/privacy'
    ) {
        return null;
    }

    return (
        <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 lg:w-72 bg-white border-r border-gray-100 z-50 p-6 px-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 px-4 mb-10 group">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform">
                    <Utensils className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-gray-900 leading-none">
                    Fast<span className="text-orange-600">Food</span>
                </h1>
            </Link>

            {/* Nav Items */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={() => router.push(item.path)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group",
                                isActive
                                    ? "bg-orange-50 text-orange-600 shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <div className={cn(
                                "p-1 rounded-lg transition-transform duration-300",
                                isActive ? "scale-110" : "group-hover:scale-110"
                            )}>
                                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                "text-sm font-bold tracking-tight",
                                isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebarActive"
                                    className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Additional Actions */}
            <div className="pt-6 border-t border-gray-50 space-y-2">
                <button
                    onClick={() => router.push('/scan')}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group"
                >
                    <QrCode className="w-6 h-6 text-orange-500" />
                    <span className="text-sm font-bold tracking-tight">QR Code Scan</span>
                </button>

                <button
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut className="w-6 h-6" />
                    <span className="text-sm font-bold tracking-tight">Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default DesktopSidebar;
