'use client';

import React from 'react';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Search, label: 'Busca', path: '/search' },
        { icon: ShoppingBag, label: 'Pedidos', path: '/orders' },
        { icon: User, label: 'Perfil', path: '/profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe">
            <div className="max-w-md mx-auto flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => router.push(item.path)}
                            className="flex flex-col items-center justify-center w-full h-full relative group transition-all"
                        >
                            <div className={cn(
                                "relative p-2 rounded-xl transition-all duration-300",
                                isActive ? "text-gray-900 scale-110" : "text-gray-400 hover:text-gray-600"
                            )}>
                                <item.icon
                                    className="w-6 h-6"
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavDot"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
