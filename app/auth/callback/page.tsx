'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const next = searchParams.get('next') || '/';

        if (token) {
            // Store token consistent with api/api.js
            localStorage.setItem('auth_token', token);

            // Dispatch a storage event or similar if we need to update context elsewhere, 
            // but simple redirect works for now.

            // Redirect to next page
            router.replace(next);
        } else {
            // If no token, redirect back to login
            router.replace('/login?error=missing_token');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Autenticando...</p>
            </motion.div>
        </div>
    );
}
