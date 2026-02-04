'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function QRScannerPage() {
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(true); // Auto-start
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;

        // Initialize scanner
        const initScanner = async () => {
            if (!mountedRef.current) return;

            try {
                // Request camera permissions explicitly first to ensure browser API is ready
                // This step is optional with html5-qrcode but good for debugging permissions
                // await navigator.mediaDevices.getUserMedia({ video: true });

                const html5QrCode = new Html5Qrcode("qr-reader");
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        handleQRCodeResult(decodedText);
                    },
                    (errorMessage) => {
                        // ignore scan errors, they happen every frame no code is detected
                    }
                );
            } catch (err) {
                console.error("Error starting scanner:", err);
                if (mountedRef.current) {
                    setError("Não foi possível acessar a câmera. Verifique as permissões.");
                }
            }
        };

        // Small timeout to ensure DOM is ready
        const timer = setTimeout(() => {
            initScanner();
        }, 500);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, []);

    const handleQRCodeResult = async (text: string) => {
        if (!isScanning || !scannerRef.current) return;

        // Pause to prevent multiple reads
        await scannerRef.current.pause();
        setIsScanning(false);

        try {
            // Validate domain
            const allowedDomains = ['https://fastfood.skyvenda.com', 'https://fastfood.skyvenda.mz'];
            const isAllowedUrl = allowedDomains.some(domain => text.startsWith(domain));

            if (isAllowedUrl) {
                try {
                    const url = new URL(text);
                    const slug = url.pathname.split('/').filter(Boolean).pop();

                    if (slug) {
                        toast.success('Restaurante encontrado! Redirecionando...');
                        router.push(`/${slug}`);
                        return;
                    }
                } catch (e) {
                    // Invalid URL parsing
                }
            }

            // If not a valid URL from our domain, treat as error or check if it's just a slug (legacy support, or optional)
            // For now, adhering strictly to user request to "only extract slug" if it starts with the domain.
            // But usually we might want to support scanning just the slug too? 
            // The user said: "verifica se a url comeca com ... e so extrai o slug". 
            // This implies: IF it is a URL, it MUST match. 
            // Only if it's NOT a URL, maybe we treat as slug? 
            // Let's be strict for safety as requested.

            throw new Error('QR Code inválido: URL não reconhecida.');

        } catch (e: any) {
            toast.error(e.message || 'QR Code inválido.');
            // Resume scanning after a delay
            setTimeout(() => {
                if (mountedRef.current && scannerRef.current) {
                    scannerRef.current.resume();
                    setIsScanning(true);
                }
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 w-full z-10 px-6 py-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all z-20"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <span className="font-black uppercase tracking-[0.2em] text-[10px] text-white/60">Escanear QR Code</span>
                <div className="w-12 h-12" /> {/* Spacer */}
            </div>

            {/* Scanner Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="w-full max-w-sm aspect-square relative rounded-[2.5rem] overflow-hidden border-2 border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.2)] bg-gray-900">
                    <div id="qr-reader" className="w-full h-full"></div>

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6 text-center">
                            <p className="text-red-400 font-bold text-sm">{error}</p>
                        </div>
                    )}

                    {!isScanning && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Custom Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
                        <div className="w-64 h-64 border-2 border-orange-500 rounded-3xl relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl -translate-x-1 -translate-y-1" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl translate-x-1 -translate-y-1" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl -translate-x-1 translate-y-1" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl translate-x-1 translate-y-1" />

                            {/* Scanning Line */}
                            {isScanning && !error && (
                                <motion.div
                                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.8)]"
                                    animate={{ top: ['5%', '95%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center max-w-xs">
                    <h3 className="text-xl font-black mb-2 flex items-center justify-center gap-2">
                        <Camera className="w-5 h-5 text-orange-500" />
                        Aponte a Câmara
                    </h3>
                    <p className="text-sm font-medium text-gray-400">
                        Posicione o QR Code do restaurante dentro do quadrado para aceder ao catálogo instantaneamente.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                #qr-reader video {
                    object-fit: cover;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 2.5rem;
                }
            `}</style>
        </div>
    );
}
