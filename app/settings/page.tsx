'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading, isLoggedIn, logout } = useAuth();

    const handleEditOnSkyVenda = () => {
        const username = user?.username;
        if (username) {
            window.open(`https://skyvenda.com/${encodeURIComponent(username)}`, '_blank', 'noopener,noreferrer');
            return;
        }
        window.open('https://skyvenda.com/login', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                <h1 className="text-lg font-black tracking-tight text-gray-900">Conta</h1>
            </header>

            <div className="max-w-md mx-auto px-4 py-6 space-y-6">
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

                        {!isLoggedIn ? (
                            <button
                                onClick={() => router.push('/login?next=/settings')}
                                className={cn(
                                    'w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                                    'bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99]'
                                )}
                            >
                                <span>Entrar</span>
                                <LogIn className="w-4 h-4" />
                            </button>
                        ) : (
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
