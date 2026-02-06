'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export default function AuthModal({
    isOpen,
    onClose,
    title = "Entre para continuar",
    description = "Crie uma conta ou faça login para curtir restaurantes e fazer pedidos."
}: AuthModalProps) {
    const router = useRouter();

    const handleLogin = () => {
        const next = typeof window !== 'undefined' ? window.location.pathname : '/';
        router.push(`/login?next=${encodeURIComponent(next)}`);
        onClose();
    };

    const handleSSO = () => {
        const next = typeof window !== 'undefined' ? window.location.pathname : '/';
        const redirectPath = '/auth/callback';
        const origin = window.location.origin;
        const redirectUri = `${origin}${redirectPath}?next=${encodeURIComponent(next)}&sso=true`;
        const loginUrl = `https://skyvenda.com/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = loginUrl;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        {/* Header Decor */}
                        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10">
                            <Lock size={120} className="text-gray-900 rotate-12" />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 sm:p-10 relative">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center mb-8">
                                <Lock className="text-orange-600" size={32} />
                            </div>

                            {/* Text */}
                            <div className="mb-10">
                                <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight">
                                    {title}
                                </h3>
                                <p className="text-gray-500 font-medium leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleLogin}
                                    className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-gray-200 hover:shadow-gray-300 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Entrar
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    onClick={handleSSO}
                                    className="w-full bg-white border-2 border-gray-100 hover:border-orange-100 hover:bg-orange-50/50 text-gray-700 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 group"
                                >
                                    <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform">
                                        SV
                                    </div>
                                    Entrar com SkyVenda MZ
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full py-2 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                                >
                                    Continuar como convidado
                                </button>
                            </div>
                        </div>

                        {/* Footer Link */}
                        <div className="px-8 py-6 bg-gray-50 text-center border-t border-gray-100">
                            <p className="text-xs text-gray-400 font-medium">
                                Novo no FastFood? <span className="text-orange-600 cursor-pointer hover:underline" onClick={handleLogin}>Cadastre-se agora</span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
