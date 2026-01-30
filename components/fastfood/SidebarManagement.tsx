'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    UtensilsCrossed,
    TrendingUp,
    Settings,
    Store,
    ArrowLeft,
    ChevronRight,
    MonitorIcon as PdvIcon,
    Table as TableIcon,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '' },
    { icon: ShoppingBag, label: 'Pedidos', path: '/orders' },
    { icon: UtensilsCrossed, label: 'Cardápio', path: '/menu' },
    { icon: TableIcon, label: 'Mesas', path: '/tables' },
    { icon: Users, label: 'Contas', path: '/tabs' },
    { icon: TrendingUp, label: 'Vendas', path: '/sales' },
    { icon: PdvIcon, label: 'SkyPDV', path: '/skypdv' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
];

export function SidebarManagement() {
    const pathname = usePathname();
    const params = useParams();
    const id = params.id as string;
    const basePath = `/fastfood/manage/${id}`;

    const isActive = (path: string) => {
        if (path === '') {
            return pathname === basePath;
        }
        return pathname.startsWith(`${basePath}${path}`);
    };

    return (
        <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 flex flex-col z-50">
            <div className="p-6">
                <Link href="/fastfood/my-restaurants" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Meus Restaurantes</span>
                </Link>

                {/* Brand */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-orange-200 shadow-lg">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Gestão</h2>
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Fastfood</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {MENU_ITEMS.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.label}
                                href={`${basePath}${item.path}`}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl transition-all group",
                                    active
                                        ? "bg-orange-500 text-white shadow-orange-100 shadow-xl"
                                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-white" : "text-gray-400")} />
                                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                {active && <ChevronRight className="w-4 h-4" />}
                                {!active && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-50">
                <div className="bg-gray-900 rounded-3xl p-4 text-white relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">Suporte</p>
                    <h4 className="text-xs font-black mb-1">Precisa de Ajuda?</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Contate nossa equipe</p>
                </div>
            </div>
        </div>
    );
}
