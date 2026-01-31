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
            className="relative w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-gray-900 group"
        >
            {/* Background Image */}
            <Image
                src={image}
                alt="Promotion"
                fill
                className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-[2s]"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-[60%]">
                {discount && (
                    <div className="inline-flex items-center self-start px-3 py-1 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-orange-500/20">
                        Exclusive {discount} OFF
                    </div>
                )}
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2 tracking-tight">
                    {title}
                </h2>
                <p className="text-gray-300 text-sm font-medium mb-6 opacity-80">
                    {subtitle}
                </p>

                <button
                    onClick={onAction}
                    className="self-start px-8 py-3 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                >
                    Peça Agora
                </button>
            </div>

            {/* Floating Elements/Glows */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        </motion.div>
    );
}
