'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Heart, LogIn, LogOut, MapPin, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useHome } from '@/context/HomeContext';
import { cn } from '@/lib/utils';
import fastfoodApi from '@/api/fastfoodApi';
import type { FastFoodOrder, Restaurant } from '@/types/fastfood';
import OrderCard from '@/components/fastfood/OrderCard';
import RestaurantCard from '@/components/fastfood/RestaurantCard';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, isLoggedIn, logout } = useAuth();
    const { restaurants, pagedRestaurants, exploreData, districtRestaurants, selectedProvince, selectedDistrict } = useHome();

    const [orders, setOrders] = useState<FastFoodOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

    const loadFavorites = () => {
        try {
            const raw = localStorage.getItem('favorite_restaurants');
            if (!raw) {
                setFavoriteIds([]);
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setFavoriteIds(parsed.map((x) => Number(x)).filter((x) => Number.isFinite(x)));
            } else {
                setFavoriteIds([]);
            }
        } catch {
            setFavoriteIds([]);
        }
    };

    const handleEditOnSkyVenda = () => {
        const username = user?.username;
        if (username) {
            window.open(`https://skyvenda.com/${encodeURIComponent(username)}`, '_blank', 'noopener,noreferrer');
            return;
        }
        window.open('https://skyvenda.com/login', '_blank', 'noopener,noreferrer');
    };

    useEffect(() => {
        loadFavorites();
        const handler = () => loadFavorites();
        window.addEventListener('fastfood-favorites-changed', handler);
        return () => window.removeEventListener('fastfood-favorites-changed', handler);
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            setOrders([]);
            return;
        }

        const run = async () => {
            try {
                setLoadingOrders(true);
                const data: FastFoodOrder[] = await fastfoodApi.getUserOrders();
                setOrders(data.sort((a: FastFoodOrder, b: FastFoodOrder) => b.id - a.id));
            } catch {
                setOrders([]);
            } finally {
                setLoadingOrders(false);
            }
        };

        run();
    }, [isLoggedIn]);

    const allRestaurants = useMemo<Restaurant[]>(() => {
        const merged = [...restaurants, ...pagedRestaurants];
        const byId = new Map<number, Restaurant>();
        for (const r of merged) byId.set(r.id, r);
        if (exploreData?.popular_restaurants) {
            for (const r of exploreData.popular_restaurants) byId.set(r.id, r);
        }
        if (exploreData?.new_restaurants) {
            for (const r of exploreData.new_restaurants) byId.set(r.id, r);
        }
        if (districtRestaurants?.length) {
            for (const r of districtRestaurants) byId.set(r.id, r);
        }
        return Array.from(byId.values());
    }, [districtRestaurants, exploreData, pagedRestaurants, restaurants]);

    const favoriteRestaurants = useMemo(() => {
        if (!favoriteIds.length) return [];
        const byId = new Map(allRestaurants.map((r: Restaurant) => [r.id, r] as const));
        return favoriteIds.map((id) => byId.get(id)).filter(Boolean) as Restaurant[];
    }, [allRestaurants, favoriteIds]);

    const suggestedRestaurants = useMemo(() => {
        const pool: Restaurant[] = [];
        if (districtRestaurants?.length) pool.push(...districtRestaurants);
        if (exploreData?.popular_restaurants?.length) pool.push(...exploreData.popular_restaurants);
        if (exploreData?.new_restaurants?.length) pool.push(...exploreData.new_restaurants);
        const byId = new Map<number, Restaurant>();
        for (const r of pool) byId.set(r.id, r);
        return Array.from(byId.values()).slice(0, 6);
    }, [districtRestaurants, exploreData]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-lg md:text-2xl font-black tracking-tight text-gray-900">Perfil</h1>
                </div>
            </header>

            <div className="max-w-md md:max-w-4xl mx-auto px-4 py-6 space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                            <UserIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Mini Perfil</p>
                            <p className="text-base font-black text-gray-900 truncate">
                                {loading ? 'Carregando...' : (user?.name || user?.username || (isLoggedIn ? 'Usuário' : 'Visitante'))}
                            </p>
                            <p className="text-xs font-bold text-gray-500 truncate">
                                {isLoggedIn ? (user?.email || user?.username || '') : 'Faça login para ver sua conta'}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 pb-6 grid grid-cols-1 gap-3">
                        {isLoggedIn ? (
                            <>
                                <button
                                    onClick={handleEditOnSkyVenda}
                                    className={cn(
                                        'w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                                        'bg-gray-900 text-white hover:bg-black active:scale-[0.99]'
                                    )}
                                >
                                    <span>Editar na SkyVenda</span>
                                    <ExternalLink className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={logout}
                                    className={cn(
                                        'w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                                        'bg-red-50 text-red-600 hover:bg-red-100 active:scale-[0.99]'
                                    )}
                                >
                                    <span>Sair</span>
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push('/login?next=/profile')}
                                className={cn(
                                    'w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                                    'bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99]'
                                )}
                            >
                                <span>Fazer login</span>
                                <LogIn className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Restaurantes Favoritos</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">Guarde seus melhores lugares</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                            <Heart className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="px-4 pb-6">
                        {favoriteRestaurants.length === 0 ? (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <p className="text-sm font-bold text-gray-900">Sem favoritos ainda</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">Explore restaurantes e salve os que você mais gosta.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {favoriteRestaurants.slice(0, 3).map((r: Restaurant) => (
                                    <div key={r.id}>
                                        <RestaurantCard restaurant={r} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Últimos Pedidos</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">Acompanhe e repita pedidos</p>
                        </div>
                        <button
                            onClick={() => router.push('/orders')}
                            className="h-10 px-4 rounded-2xl bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest"
                        >
                            Ver Todos
                        </button>
                    </div>

                    <div className="px-4 pb-6">
                        {!isLoggedIn ? (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <p className="text-sm font-bold text-gray-900">Entre para ver seus pedidos</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">Seu histórico aparece aqui assim que fizer login.</p>
                            </div>
                        ) : loadingOrders ? (
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-44 bg-gray-50 rounded-3xl animate-pulse border border-gray-100" />
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <p className="text-sm font-bold text-gray-900">Ainda sem pedidos</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">Faça seu primeiro pedido e ele vai aparecer aqui.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.slice(0, 2).map((o: FastFoodOrder) => (
                                    <div key={o.id}>
                                        <OrderCard order={o} onViewDetails={() => router.push(`/orders/${o.id}`)} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Sugestões</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">Restaurantes próximos de você</p>
                            {(selectedDistrict || selectedProvince) && (
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-bold truncate max-w-[220px]">
                                        {[selectedDistrict, selectedProvince].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => router.push('/nearby')}
                            className="h-10 px-4 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest"
                        >
                            Perto de Mim
                        </button>
                    </div>

                    <div className="px-4 pb-6">
                        {suggestedRestaurants.length === 0 ? (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <p className="text-sm font-bold text-gray-900">Sem sugestões agora</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">Tente ativar a localização ou volte mais tarde.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {suggestedRestaurants.slice(0, 3).map((r: Restaurant) => (
                                    <div key={r.id}>
                                        <RestaurantCard restaurant={r} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Sobre</p>
                    <p className="text-sm font-bold text-gray-900">FastFood é parte do ecossistema SkyVenda MZ.</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Gerencie seu perfil completo e dados da conta na SkyVenda.</p>
                </div>
            </div>
        </div>
    );
}
