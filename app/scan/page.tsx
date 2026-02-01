'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function QRScannerPage() {
    const router = useRouter();
    const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only initialize on client
        if (typeof window === 'undefined') return;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [0], // 0 for camera
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        };

        const newScanner = new Html5QrcodeScanner('qr-reader', config, false);

        const onScanSuccess = (decodedText: string) => {
            console.log(`Scan success: ${decodedText}`);
            setScannedResult(decodedText);
            newScanner.clear().catch(err => console.error("Failed to clear scanner", err));
            handleQRCodeResult(decodedText);
        };

        const onScanFailure = (error: string) => {
            // Too noisy to show every failure
            // console.warn(`Scan error: ${error}`);
        };

        newScanner.render(onScanSuccess, onScanFailure);
        setScanner(newScanner);

        return () => {
            if (newScanner) {
                newScanner.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
            }
        };
    }, []);

    const handleQRCodeResult = (text: string) => {
        try {
            // Try to see if it's a URL
            const url = new URL(text);
            // If it's a link to our app, extract the slug
            // Expecting something like https://fastfood.skyvenda.mz/restaurant-slug
            // or just /restaurant-slug
            const pathname = url.pathname;
            const slug = pathname.split('/').filter(Boolean).pop();

            if (slug) {
                toast.success('Restaurante encontrado! Redirecionando...');
                router.push(`/${slug}`);
            } else {
                toast.error('QR Code inválido: Não foi possível identificar o restaurante.');
                resetScanner();
            }
        } catch (e) {
            // Not a URL, maybe it's just the slug?
            if (text && text.length > 2 && !text.includes(' ')) {
                toast.success('Restaurante encontrado! Redirecionando...');
                router.push(`/${text}`);
            } else {
                toast.error('QR Code inválido.');
                resetScanner();
            }
        }
    };

    const resetScanner = () => {
        setScannedResult(null);
        window.location.reload(); // Simplest way to restart html5-qrcode-scanner
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 w-full z-10 px-6 py-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <span className="font-black uppercase tracking-[0.2em] text-[10px] text-white/60">Escanear QR Code</span>
                <div className="w-12 h-12" /> {/* Spacer */}
            </div>

            {/* Scanner Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="w-full max-w-sm aspect-square relative rounded-[2.5rem] overflow-hidden border-2 border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.2)] bg-gray-900/50">
                    <div id="qr-reader" className="w-full h-full border-none"></div>

                    {/* Custom Overlay (simulated because html5-qrcode doesn't allow full CSS control easily) */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-orange-500 rounded-3xl relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl -translate-x-1 -translate-y-1" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl translate-x-1 -translate-y-1" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl -translate-x-1 translate-y-1" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl translate-x-1 translate-y-1" />

                            {/* Scanning Line */}
                            <motion.div
                                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.8)]"
                                animate={{ top: ['5%', '95%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
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
        #qr-reader {
          border: none !important;
          background: transparent !important;
        }
        #qr-reader__scan_region {
           background: transparent !important;
        }
        #qr-reader__dashboard {
          display: none !important; /* Hide the ugly default dashboard */
        }
        #qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 2.5rem !important;
        }
      `}</style>
        </div>
    );
}
