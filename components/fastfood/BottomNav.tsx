'use client';

import React from 'react';
import { Home, Search, ShoppingBag, Settings, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Search, label: 'Busca', path: '/nearby' },
        { icon: ShoppingBag, label: 'Pedidos', path: '/orders' },
        { icon: Settings, label: 'Conta', path: '/settings' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
            <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-around p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => router.push(item.path)}
                            className={cn(
                                "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all relative overflow-hidden group",
                                isActive ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                            {isActive && (
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
