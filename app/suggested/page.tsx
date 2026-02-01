'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, ShieldCheck } from 'lucide-react';
import { useHome } from '@/context/HomeContext';
import RestaurantCard from '@/components/fastfood/RestaurantCard';
import { motion } from 'framer-motion';

export default function SuggestedPage() {
    const router = useRouter();
    const { restaurants, loading } = useHome();

    // Filter suggested restaurants (in this case, we use the popular ones from home context)
    // If the context is empty (e.g., direct access), it will show loading

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Mini Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-black text-gray-900 tracking-tight">Sugeridos</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Para o seu paladar</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Sugeridos para Si</h2>
                        <p className="text-sm font-medium text-gray-400">Os melhores restaurantes escolhidos com base na sua experiência.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[1.5rem] shadow-sm h-48 animate-pulse p-4 flex gap-4">
                                <div className="w-48 bg-gray-100 rounded-xl"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                    <div className="h-6 bg-gray-50 rounded-xl w-24 mt-auto"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : restaurants.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star className="w-10 h-10 text-gray-200" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 mb-2">Sem sugestões no momento</h4>
                        <p className="text-gray-400 text-sm font-medium">Continue explorando para descobrirmos o que você gosta.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 px-8 py-3 bg-gray-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-orange-500 transition-all"
                        >
                            Voltar à Home
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {restaurants.map((restaurant, index) => (
                            <motion.div
                                key={restaurant.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <RestaurantCard restaurant={restaurant} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
