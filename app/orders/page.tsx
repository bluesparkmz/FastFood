'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, UtensilsCrossed, RefreshCw } from 'lucide-react';
import OrderCard from '@/components/fastfood/OrderCard';
import fastfoodApi from '@/api/fastfoodApi';
import type { FastFoodOrder } from '@/types/fastfood';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<FastFoodOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await fastfoodApi.getUserOrders();
      // Sort orders by id descending (newest first)
      setOrders(data.sort((a, b) => b.id - a.id));
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 mb-6">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Meus Pedidos</h1>
          </div>
          {!loading && (
            <button
              onClick={fetchOrders}
              className="p-2 text-orange-500 hover:bg-orange-50 rounded-full transition-colors active:rotate-180 duration-500"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-3xl mx-auto px-4">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-6 h-48 animate-pulse shadow-sm border border-gray-100">
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="h-8 bg-gray-200 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justifyContent-center py-20 px-6 text-center"
          >
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
              <UtensilsCrossed className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Sem pedidos ainda
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
              Explore os melhores restaurantes e faça seu primeiro pedido através do SkyVenda FastFood.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-gray-900/20 active:scale-95 transition-all w-full md:w-auto"
            >
              Explorar Restaurantes
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OrderCard
                  order={order}
                  onViewDetails={() => router.push(`/orders/${order.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
