'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import type { MenuItem } from '@/types/fastfood';
import { getImageUrl, isEmoji } from '@/utils/imageUtils';

interface MenuItemCardProps {
  item: MenuItem;
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
}

export default function MenuItemCard({
  item,
  quantity = 0,
  onAdd,
  onRemove
}: MenuItemCardProps) {
  const defaultImage = '/images/food-placeholder.svg';
  const imageUrl = getImageUrl(item.image) || defaultImage;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-3 p-3">
        {/* Image / Emoji */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-50">
          {item.image && !isEmoji(item.image) ? (
            <Image
              src={getImageUrl(item.image) || defaultImage}
              alt={item.name}
              fill
              className="object-cover"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultImage;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">
              {isEmoji(item.image) ? item.image : (item.emoji || '🍔')}
            </div>
          )}
          {item.is_available === false && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Indisponível</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-sm truncate">
            {item.name}
          </h4>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-orange-600 font-bold text-sm">
              {(Number(item.price) || 0).toFixed(2)} MT
            </span>

            {/* Quantity Controls */}
            {onAdd && onRemove && (
              <div className="flex items-center gap-2">
                {quantity > 0 && (
                  <>
                    <button
                      onClick={onRemove}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      disabled={item.is_available === false}
                    >
                      <Minus className="w-3 h-3 text-gray-700" />
                    </button>
                    <span className="text-sm font-semibold text-gray-700 w-6 text-center">
                      {quantity}
                    </span>
                  </>
                )}
                <button
                  onClick={onAdd}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${item.is_available === false
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  disabled={item.is_available === false}
                >
                  <Plus className={`w-3 h-3 ${item.is_available === false ? 'text-gray-400' : 'text-white'}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
