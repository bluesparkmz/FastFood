'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Utensils, Star, ChevronRight, History, TrendingUp, ChevronLeft } from 'lucide-react';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant } from '@/types/fastfood';
import RestaurantCard from '@/components/fastfood/RestaurantCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const POPULAR_RESTOS = ["Burger", "Pizza", "Sushi", "Chicken"];

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                performSearch();
            } else {
                setResults([]);
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    const performSearch = async () => {
        try {
            setLoading(true);
            setIsSearching(true);
            const data = await fastfoodApi.searchAll(query);
            setResults(data.restaurants);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Search Header */}
            <div className="sticky top-0 z-50 bg-white px-6 pt-6 pb-6 border-b border-gray-50 space-y-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-gray-900">
                            Pesquisar <span className="text-orange-600">Comida</span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encontre o que deseja</p>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Pesquisar por restaurantes ou pratos..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-12 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all shadow-sm"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-900"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <main className="p-6 max-w-2xl mx-auto">
                {!isSearching ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Recent/Popular searches */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Popular Searches</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {POPULAR_RESTOS.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => setQuery(tag)}
                                        className="px-5 py-2.5 bg-gray-50 hover:bg-orange-50 rounded-xl text-xs font-bold text-gray-600 hover:text-orange-600 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Illustration/Empty State */}
                        <div className="py-20 text-center space-y-4 opacity-50">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <Utensils className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">Discover your next favorite meal</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                Search Results ({results.length})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-40 bg-gray-50 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-4">
                                {results.map((resto) => (
                                    <RestaurantCard key={resto.id} restaurant={resto} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-gray-400 font-bold">No results found for "{query}"</p>
                                <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Try another keyword</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
