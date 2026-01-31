'use client';

import React from 'react';
import { Clock, MapPin, DollarSign, Calendar, ChevronRight, ShoppingBag } from 'lucide-react';
import type { FastFoodOrder } from '@/types/fastfood';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: FastFoodOrder;
  onViewDetails?: () => void;
}

const statusConfig = {
  pending: { label: 'Pendente', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  preparing: { label: 'Preparando', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ready: { label: 'Pronto', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  delivering: { label: 'Em entrega', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  completed: { label: 'Concluído', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  cancelled: { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  rejected: { label: 'Rejeitado', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' },
};

export default function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div
      className="group bg-white rounded-[2rem] border border-gray-100 p-6 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={onViewDetails}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg", status.bg, status.text)}>
            #{order.id}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {order.items.length} {order.items.length === 1 ? 'Item' : 'Itens'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <Calendar className="w-4 h-4" />
              {formatDate(order.created_at)}
            </div>
          </div>
        </div>

        <div className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border", status.bg, status.text, status.border)}>
          {status.label}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-sm font-medium text-gray-500">Valor Total</span>
          <span className="text-lg font-black text-gray-900">{Number(order.total_value).toFixed(2)} MT</span>
        </div>

        {order.delivery_address && (
          <div className="flex items-start gap-3 px-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {order.delivery_address}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full",
            order.payment_status === 'paid' ? 'bg-green-500' :
              order.payment_status === 'refunded' ? 'bg-gray-400' : 'bg-yellow-500'
          )} />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {order.payment_method}
          </span>
        </div>

        <span className="flex items-center gap-1 text-sm font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
          Ver Detalhes <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}
