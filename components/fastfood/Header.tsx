'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Bell, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Header() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Determine visibility
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setIsVisible(false); // Scrolling down - hide
            } else {
                setIsVisible(true); // Scrolling up - show
            }

            // Determine background state
            setIsScrolled(currentScrollY > 20);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.header
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    exit={{ y: -100 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className={cn(
                        "fixed top-0 left-0 w-full z-[60] transition-all duration-300 px-6 py-4 flex items-center justify-between",
                        isScrolled ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm" : "bg-white"
                    )}
                >
                    <div className="flex items-center gap-2" onClick={() => router.push('/')}>
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-gray-900">
                            Fast<span className="text-orange-600">Food</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-1 text-gray-400 hover:text-gray-900 transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button className="p-1 text-gray-900">
                            <Menu className="w-7 h-7" />
                        </button>
                    </div>
                </motion.header>
            )}
        </AnimatePresence>
    );
}
