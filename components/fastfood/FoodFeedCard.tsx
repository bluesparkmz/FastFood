"use client";

import React from 'react';
import Image from 'next/image';
import { ShoppingCart, Star, Clock } from 'lucide-react';
import { MenuItem } from '@/types/fastfood';
import { motion } from 'framer-motion';

interface FoodFeedCardProps {
    item: MenuItem;
    restaurantName: string;
    onClick?: () => void;
}

export default function FoodFeedCard({ item, restaurantName, onClick }: FoodFeedCardProps) {
    const defaultImage = '/images/food-placeholder.jpg';
    const imageUrl = item.image || defaultImage;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-gray-100 group flex flex-col h-full"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        {item.emoji || '🍔'}
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-gray-900 shadow-sm">
                        {restaurantName}
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-gray-900 text-lg leading-tight line-clamp-1">
                        {item.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg">
                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                        <span className="text-[10px] font-bold text-orange-700">4.5</span>
                    </div>
                </div>

                <p className="text-gray-500 text-xs font-medium line-clamp-2 mb-4 flex-1">
                    {item.description || "Delicioso prato preparado com os melhores ingredientes locais."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">A partir de</span>
                        <span className="text-xl font-black text-orange-600">
                            {(Number(item.price) || 0).toFixed(2)} <span className="text-xs">MT</span>
                        </span>
                    </div>

                    <button
                        onClick={onClick}
                        className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-orange-200 shadow-lg hover:bg-orange-600 transition-all active:scale-95"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
