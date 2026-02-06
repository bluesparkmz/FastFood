'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronLeft, Utensils, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface FastfoodNotification {
  id?: number | string;
  type: string;
  title: string;
  message: string;
  timestamp?: string;
  data?: any;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState<FastfoodNotification[]>([]);

  useEffect(() => {
    const handler = (event: any) => {
      const payload = event.detail || {};
      const data = payload.data || {};

      const notificationType =
        data.notification_type || data.type || payload.type || payload.tipo || '';
      const referenceType = data.reference_type || '';

      // Consideramos "FastFood" quando é de pedido ou referencia FastFoodOrder
      const isFastfoodRelated =
        notificationType?.startsWith('order_') ||
        referenceType === 'FastFoodOrder' ||
        data.reference_type === 'FastFoodOrder';

      if (!isFastfoodRelated) return;

      const notif: FastfoodNotification = {
        id: data.id || payload.id || `${Date.now()}-${Math.random()}`,
        type: notificationType || 'notification',
        title: payload.title || 'Notificação FastFood',
        message: data.message || payload.message || '',
        timestamp: payload.timestamp || data.created_at || new Date().toISOString(),
        data,
      };

      setNotifications(prev => {
        const existingIdx = prev.findIndex(n => n.id === notif.id);
        if (existingIdx !== -1) {
          const copy = [...prev];
          copy[existingIdx] = notif;
          return copy;
        }
        return [notif, ...prev].slice(0, 50);
      });
    };

    window.addEventListener('new-notification', handler as any);
    return () => window.removeEventListener('new-notification', handler as any);
  }, []);

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleOpenReference = (n: FastfoodNotification) => {
    const refType = n.data?.reference_type;
    const refId = n.data?.reference_id;

    if (refType === 'FastFoodOrder' && refId) {
      router.push(`/orders/${refId}`);
      return;
    }

    if (n.data?.target_url) {
      try {
        window.open(n.data.target_url, '_blank', 'noopener,noreferrer');
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl md:max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors md:hidden"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Notificações
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl md:max-w-5xl mx-auto px-4 py-6 space-y-6">
        {!isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-sm text-yellow-800">
            Entre para receber notificações personalizadas dos seus pedidos FastFood.
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-gray-100 py-16 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Utensils className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-1">Sem notificações FastFood ainda</h2>
            <p className="text-sm text-gray-500">
              Quando seus pedidos forem atualizados, eles vão aparecer aqui.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={cn(
                    'bg-white rounded-2xl border border-gray-100 p-4 flex gap-3',
                    'shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                  )}
                  onClick={() => handleOpenReference(n)}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 truncate">
                        {n.type.replace(/^order_/, 'Pedido ').replace(/_/g, ' ')}
                      </p>
                      {n.timestamp && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatTime(n.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {n.message || n.title}
                    </p>
                    {n.data?.reference_type === 'FastFoodOrder' && n.data?.reference_id && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-orange-600">
                        <ExternalLink className="w-3 h-3" />
                        Ver detalhes do pedido #{n.data.reference_id}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

