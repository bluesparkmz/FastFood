'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, Star, ChevronRight, ShieldCheck } from 'lucide-react';
import type { Restaurant } from '@/types/fastfood';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/utils/imageUtils';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const defaultImage = '/images/restaurant-placeholder.svg';
  const imageUrl = getImageUrl(restaurant.cover_image) || defaultImage;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link href={`/${restaurant.slug}`}>
        <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden group flex flex-row h-full hover:shadow-xl hover:border-orange-100 transition-all duration-300">
          {/* Cover Image */}
          <div className="relative w-32 sm:w-40 md:w-56 lg:w-64 flex-shrink-0 overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e: any) => {
                e.target.src = defaultImage;
              }}
            />

            {/* Overlay Status */}
            {!restaurant.is_open && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] border border-white/30 px-4 py-1.5 rounded-full bg-black/20">Fechado</span>
              </div>
            )}

            {/* Float Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {restaurant.is_open && (
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                  Aberto Agora
                </div>
              )}
            </div>

            {/* Premium Badge */}
            {restaurant.rating >= 4.5 && (
              <div className="absolute bottom-3 right-3 bg-red-600 text-white p-1.5 rounded-xl shadow-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Restaurant Info */}
          <div className="p-4 md:p-6 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-1 md:mb-2 gap-2">
                <div className="space-y-0.5 md:space-y-1 overflow-hidden">
                  {restaurant.category && (
                    <span className="text-[9px] md:text-[10px] font-black text-orange-600 uppercase tracking-widest">
                      {restaurant.category}
                    </span>
                  )}
                  <h3 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-orange-600 transition-colors truncate">
                    {restaurant.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg border border-gray-100 flex-shrink-0">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs md:text-sm font-black text-gray-900">{(Number(restaurant.rating) || 0).toFixed(1)}</span>
                </div>
              </div>

              {/* Location & Time */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2 md:gap-x-4 mt-2 md:mt-3">
                {(restaurant.district || restaurant.province) && (
                  <div className="flex items-center text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                    <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1 md:mr-1.5 text-orange-500" />
                    <span className="truncate max-w-[80px] md:max-w-none">
                      {[restaurant.district, restaurant.province].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {restaurant.opening_time && (
                  <div className="flex items-center text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                    <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1 md:mr-1.5" />
                    <span>{restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time?.slice(0, 5)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-3 md:mt-6 pt-2 md:pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                {restaurant.min_delivery_value > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-bold opacity-60 text-[8px] md:text-[10px]">Pedido Mínimo</span>
                    <span className="text-orange-600 text-xs md:text-sm">{(Number(restaurant.min_delivery_value) || 0).toFixed(0)} MT</span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-emerald-600 text-xs md:text-sm font-black">Entrega Grátis</span>
                  </div>
                )}
              </div>

              <div className="group-hover:translate-x-1 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
