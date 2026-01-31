'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PromoBannerProps {
    image: string;
    title: string;
    subtitle: string;
    discount?: string;
    onAction?: () => void;
}

export default function PromoBanner({ image, title, subtitle, discount, onAction }: PromoBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full h-[200px] rounded-xl overflow-hidden shadow-lg shadow-orange-500/20"
        >
            {/* Orange Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700" />

            {/* Pattern Overlay for Texture */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }} />
            </div>

            {/* Content Container */}
            <div className="relative h-full flex items-center justify-between px-4 md:px-6">
                {/* Left Side: Text Content */}
                <div className="flex-1 pr-4 z-10">
                    <h2 className="text-white text-xl md:text-2xl font-black leading-tight mb-2 drop-shadow-md">
                        {title}
                    </h2>

                    <button
                        onClick={onAction}
                        className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95"
                    >
                        Order Now
                    </button>
                </div>

                {/* Right Side: Image & Badge */}
                <div className="relative flex-shrink-0 w-[140px] h-[140px] md:w-[160px] md:h-[160px]">
                    {/* Discount Badge */}
                    {discount && (
                        <div className="absolute -top-2 -left-2 z-20 w-14 h-14 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                            <span className="text-orange-600 text-xs font-black leading-none">{discount}</span>
                            <span className="text-orange-600 text-[10px] font-bold leading-none">OFF</span>
                        </div>
                    )}

                    {/* Burger Image */}
                    <div className="relative w-full h-full">
                        <Image
                            src={image}
                            alt="Promotion"
                            fill
                            className="object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>
            </div>

            {/* Decorative Glow Effects */}
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-400/30 rounded-full blur-2xl" />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
        </motion.div>
    );
}
