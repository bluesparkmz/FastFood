'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'; // Using Lucide icons as per project style
import { cn } from '@/lib/utils';
import api from '@/api/api';
// import { useAuth } from '@/contexts/AuthContext'; // If we add AuthContext later

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Manual login logic mimicking SkyPDV's AuthContext login
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('username', username);
            params.append('password', password);
            // Empty string for scope, client_id, client_secret as per SkyPDV example
            params.append('scope', '');
            params.append('client_id', 'string');
            params.append('client_secret', 'string');

            // Using direct fetch or api call. api.js handles JSON but token endpoint is form-urlencoded.
            // We'll use fetch here to match SkyPDV logic exactly or modify code to use api.js if possible.
            // But api.js assumes JSON. So let's use fetch.
            const response = await fetch('https://api.skyvenda.com/user/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }

            const data = await response.json();
            const token = data.access_token;

            if (token) {
                localStorage.setItem('auth_token', token);
                // Optionally fetch user profile
                router.push(next);
            } else {
                throw new Error('Token não recebido');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSSO = () => {
        setIsLoading(true);
        // Construct redirect URI. 
        // Assuming we want to come back to /auth/callback
        const redirectPath = '/auth/callback';
        const origin = window.location.origin;
        const redirectUri = `${origin}${redirectPath}?next=${encodeURIComponent(next)}&sso=true`;

        // SkyVenda login URL
        const loginUrl = `https://skyvenda.com/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

        window.location.href = loginUrl;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden z-10"
            >
                <div className="p-8 pb-6 text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                        <span className="text-2xl font-black text-white">FF</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Bem-vindo de volta!</h1>
                    <p className="text-gray-500 text-sm">Faça login na sua conta FastFood</p>
                </div>

                <div className="p-8 pt-0 space-y-6">
                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase">Email ou Usuário</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium text-gray-900 transition-all"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 ml-1 uppercase">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium text-gray-900 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-gray-200 hover:shadow-gray-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Entrando...' : (
                                    <>
                                        Entrar
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-300 uppercase">Ou continue com</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSSO}
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-gray-100 hover:border-orange-100 hover:bg-orange-50/50 text-gray-700 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 group"
                    >
                        {/* SkyVenda Logo Placeholder or Icon */}
                        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform">
                            SV
                        </div>
                        Entrar com SkyVenda MZ
                    </button>
                </div>

                <div className="p-6 bg-gray-50/50 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">
                        Não tem uma conta? <a href="#" className="text-orange-600 hover:underline">Cadastre-se</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
