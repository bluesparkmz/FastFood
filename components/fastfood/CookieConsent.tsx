'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already explicitly accepted or if it's their first time
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Small delay to not overwhelm the user immediately on load
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setIsVisible(false);
        localStorage.setItem('cookie_consent', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 z-[100] md:max-w-md md:left-auto"
                >
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Cookie className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Usamos Cookies 🍪</h3>
                                    <button
                                        onClick={handleAccept}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Utilizamos cookies para melhorar sua experiência e personalizar o conteúdo. Ao continuar, você concorda com nossa{' '}
                                    <Link href="/privacy" className="text-orange-600 font-bold hover:underline">
                                        Política de Privacidade
                                    </Link>.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-gray-900 text-white text-xs font-bold py-3 rounded-xl hover:bg-black transition-colors"
                            >
                                Aceitar e Continuar
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
