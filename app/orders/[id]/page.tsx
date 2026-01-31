'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, Clock, MapPin, DollarSign, CheckCircle2,
    ChefHat, Truck, XCircle, AlertCircle, Phone, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import fastfoodApi from '@/api/fastfoodApi';
import type { FastFoodOrder } from '@/types/fastfood';
import { getImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const statusSteps = [
    { id: 'pending', label: 'Pendente', icon: Clock },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'ready', label: 'Pronto', icon: CheckCircle2 },
    { id: 'delivering', label: 'Em entrega', icon: Truck },
    { id: 'completed', label: 'Concluído', icon: CheckCircle2 },
];

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const [order, setOrder] = useState<FastFoodOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchOrderDetails(params.id as string);
        }
    }, [params.id]);

    // Listen for real-time notifications to refresh the status
    useEffect(() => {
        const handleNewNotification = (event: any) => {
            const data = event.detail;
            const orderId = Number(params.id);

            // Notification type check (e.g., order_accepted, order_ready, order_delivering, order_completed)
            const isStatusUpdate = data?.tipo?.startsWith('order_') || data?.type?.startsWith('order_');
            const matchesOrder = Number(data?.data?.order_id) === orderId || Number(data?.order_id) === orderId;

            if (isStatusUpdate && matchesOrder) {
                console.log('Real-time: Order status update received, refreshing details...');
                fetchOrderDetails(String(orderId));
            }
        };

        window.addEventListener('new-notification' as any, handleNewNotification);
        return () => {
            window.removeEventListener('new-notification' as any, handleNewNotification);
        };
    }, [params.id]);

    // Polling fallback for status updates (every 20 seconds)
    useEffect(() => {
        if (!order) return;

        // Only poll if the order is in an active state
        const isActive = !['completed', 'cancelled', 'rejected'].includes(order.status);

        if (!isActive) return;

        const interval = setInterval(() => {
            console.log('Polling: Checking order status...');
            fetchOrderDetails(String(order.id), false); // Pass false to avoid showing full-page loader
        }, 20000);

        return () => clearInterval(interval);
    }, [order?.id, order?.status]);

    const fetchOrderDetails = async (id: string, showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const data = await fastfoodApi.getOrderDetails(Number(id));
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            if (showLoading) toast.error('Erro ao carregar detalhes do pedido');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;
        try {
            if (confirm('Tem certeza que deseja cancelar este pedido?')) {
                await fastfoodApi.cancelOrder(order.id);
                toast.success('Pedido cancelado com sucesso');
                fetchOrderDetails(String(order.id));
            }
        } catch (error) {
            console.error('Error canceling order:', error);
            toast.error('Erro ao cancelar pedido');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse bg-white p-8 rounded-[2rem] shadow-xl">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Pedido não encontrado</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-6 text-orange-600 font-bold hover:underline"
                >
                    Voltar para Pedidos
                </button>
            </div>
        );
    }

    const currentStepIndex = statusSteps.findIndex(step => step.id === order.status);
    const isCancelled = order.status === 'cancelled';
    const isRejected = order.status === 'rejected';

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Pedido #{order.id}</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {new Date(order.created_at).toLocaleDateString('pt-MZ', {
                                day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {/* Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
                >
                    {isCancelled || isRejected ? (
                        <div className={cn(
                            "flex flex-col items-center py-6 px-4 rounded-[1.5rem] text-center",
                            isRejected ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-50 text-gray-500 border border-gray-100"
                        )}>
                            {isRejected ? (
                                <AlertCircle className="w-16 h-16 mb-4 animate-bounce" />
                            ) : (
                                <XCircle className="w-16 h-16 mb-4" />
                            )}
                            <h2 className="text-2xl font-black mb-2">
                                {isRejected ? "Pedido Rejeitado" : "Pedido Cancelado"}
                            </h2>
                            <p className="text-sm font-medium max-w-xs mx-auto">
                                {isRejected
                                    ? "Pedimos desculpa, mas o restaurante não pôde aceitar o seu pedido neste momento. Se usou SkyWallet, o valor foi reembolsado."
                                    : "Este pedido foi cancelado e não será processado."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />
                            <div className="space-y-8 relative">
                                {statusSteps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;
                                    const Icon = step.icon;

                                    // Don't show delivering for local orders if needed, strictly following status
                                    if (order.order_type === 'local' && step.id === 'delivering') return null;

                                    return (
                                        <div key={step.id} className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 transition-colors duration-500",
                                                isCompleted ? "bg-orange-500 border-orange-100 shadow-orange-200 shadow-lg" : "bg-white border-gray-100 text-gray-300"
                                            )}>
                                                <Icon className={cn("w-5 h-5", isCompleted ? "text-white" : "text-gray-300")} />
                                            </div>
                                            <div className={cn("pt-2 transition-colors duration-500", isCurrent ? "opacity-100" : isCompleted ? "opacity-70" : "opacity-40")}>
                                                <h3 className={cn("font-bold text-lg leading-none mb-1", isCurrent ? "text-gray-900" : "text-gray-500")}>{step.label}</h3>
                                                {isCurrent && <p className="text-xs font-bold text-orange-500 uppercase tracking-widest animate-pulse">Em progresso</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Restaurant Info */}
                {(order as any).restaurant_name && (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Restaurante</p>
                                <h3 className="text-xl font-black text-gray-900">{(order as any).restaurant_name}</h3>
                            </div>
                            {(order as any).restaurant_phone && (order as any).restaurant_phone !== "N/A" && (
                                <a href={`tel:${(order as any).restaurant_phone}`} className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors active:scale-95 shadow-md shadow-green-100">
                                    <Phone className="w-5 h-5" />
                                </a>
                            )}
                        </div>

                        {((order as any).restaurant_location || (order as any).restaurant_neighborhood) && (
                            <div className="pt-4 border-t border-gray-50 flex flex-col gap-2">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Localização</p>
                                        <p className="text-sm text-gray-500">
                                            {(order as any).restaurant_location || [
                                                (order as any).restaurant_neighborhood,
                                                (order as any).restaurant_province
                                            ].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Items List */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-orange-500 rounded-full" />
                        Itens do Pedido
                    </h3>
                    <div className="divide-y divide-gray-100">
                        {order.items.map((item, idx) => {
                            // Check for image property defensively as API might vary
                            const itemImage = (item as any).image || (item as any).photo || (item as any).product?.image || (item as any).product?.photo;
                            const itemName = (item as any).name || (item as any).product?.name;
                            // Defensive price fallback
                            const itemPrice = item.price || (item as any).product?.price || 0;

                            return (
                                <div key={idx} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                                    {itemImage ? (
                                        <img
                                            src={getImageUrl(itemImage)}
                                            alt={itemName}
                                            className="w-16 h-16 rounded-2xl object-cover bg-gray-100"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-xs">IMG</div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{itemName}</h4>
                                        <p className="text-gray-500 text-xs mt-1">
                                            {Number(itemPrice).toFixed(2)} MT x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="font-black text-gray-900">
                                        {(Number(itemPrice) * Number(item.quantity)).toFixed(2)} MT
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 pt-6 border-t border-dashed border-gray-200 space-y-3">
                        <div className="flex justify-between text-gray-500 text-sm">
                            <span>Subtotal</span>
                            <span>{Number(order.total_value).toFixed(2)} MT</span>
                        </div>
                        {/* Delivery Fee if applicable - currently simplified to just total */}
                        <div className="flex justify-between text-gray-900 font-black text-xl pt-2">
                            <span>Total</span>
                            <span>{Number(order.total_value).toFixed(2)} MT</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Info */}
                {order.delivery_address && (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            Entrega
                        </h3>
                        <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl">
                            {order.delivery_address}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 font-bold">
                            <AlertCircle className="w-4 h-4" />
                            Tempo estimado de entrega: 30-45 min
                        </div>
                    </div>
                )}

                {/* Actions */}
                {order.status === 'pending' && (
                    <button
                        onClick={handleCancelOrder}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-colors active:scale-95"
                    >
                        Cancelar Pedido
                    </button>
                )}
            </div>
        </div>
    );
}
