'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export interface PromoSlide {
    image: string;
    title: string;
    subtitle: string;
    discount?: string;
    onAction?: () => void;
}

interface PromoBannerProps {
    slides: PromoSlide[];
    autoPlayInterval?: number;
}

export default function PromoBanner({ slides, autoPlayInterval = 5000 }: PromoBannerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (!slides.length) return;
        const timer = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(timer);
    }, [nextSlide, autoPlayInterval, slides.length]);

    if (!slides.length) return null;

    const currentSlide = slides[currentIndex];

    // Animation variants
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <div className="relative w-full h-[200px] md:h-[350px] lg:h-[400px] group overflow-hidden rounded-[2.5rem] md:rounded-[3rem]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    <div className="relative w-full h-full p-6 md:p-12 lg:p-16 flex items-center justify-between overflow-hidden shadow-xl shadow-orange-500/10">
                        {/* Orange Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600" />

                        {/* Pattern Overlay for Texture */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '32px 32px'
                            }} />
                        </div>

                        {/* Left Side: Content */}
                        <div className="relative z-10 flex flex-col gap-2 md:gap-4 max-w-[65%]">
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-orange-100 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] drop-shadow-sm"
                            >
                                {currentSlide.subtitle}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-white text-lg md:text-4xl lg:text-5xl font-black leading-tight mb-2 md:mb-6 drop-shadow-md tracking-tighter max-w-2xl"
                            >
                                {currentSlide.title}
                            </motion.h2>
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                onClick={currentSlide.onAction}
                                className="w-fit flex items-center gap-2 px-4 py-2 md:px-8 md:py-4 bg-white hover:bg-orange-50 text-orange-600 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 group/btn"
                            >
                                Pedir Agora
                                <ChevronRight className="w-3 h-3 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </motion.button>
                        </div>

                        {/* Right Side: Image & Badge */}
                        <div className="relative flex-shrink-0 w-[120px] h-[120px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px]">
                            {/* Discount Badge */}
                            {currentSlide.discount && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.5 }}
                                    className="absolute -top-1 -right-1 z-20 w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-orange-500/10"
                                >
                                    <span className="text-orange-600 text-sm font-black leading-none">{currentSlide.discount}</span>
                                    <span className="text-orange-600 text-[10px] font-bold leading-none">OFF</span>
                                </motion.div>
                            )}

                            {/* Burger Image */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={currentSlide.image}
                                    alt="Promotion"
                                    fill
                                    className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                    priority
                                />
                            </motion.div>
                        </div>

                        {/* Decorative Glow Effects */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/30 rounded-full blur-3xl" />
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* dots */}
            <div className="absolute bottom-4 left-6 flex items-center gap-2 z-20">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex
                            ? 'bg-white w-6 shadow-sm'
                            : 'bg-white/40 w-1.5 hover:bg-white/60'
                            }`}
                        aria-label={`Ir para slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
