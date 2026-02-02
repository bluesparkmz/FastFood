'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { login } = useAuth();

    useEffect(() => {
        const handleAuth = async () => {
            const token = searchParams.get('token');
            const next = searchParams.get('next') || '/';

            if (token) {
                try {
                    // Use context login to update state and fetch profile
                    await login(token);
                    // Redirect to next page after successful login state update
                    router.replace(next);
                } catch (error) {
                    console.error('Login error in callback:', error);
                    router.replace('/login?error=auth_failed');
                }
            } else {
                // If no token, redirect back to login
                router.replace('/login?error=missing_token');
            }
        };

        handleAuth();
    }, [searchParams, router, login]);

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

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
