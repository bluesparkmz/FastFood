'use client';

import React from 'react';
import RestaurantCard from './RestaurantCard';

const SkeletonBase = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export const CategorySkeleton = () => (
    <div className="flex items-start gap-6 min-w-max px-6 py-8 overflow-x-auto no-scrollbar">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
                <SkeletonBase className="w-16 h-16 rounded-2xl" />
                <SkeletonBase className="w-12 h-2 rounded-full" />
            </div>
        ))}
    </div>
);

export const HeroSkeleton = () => (
    <div className="px-4 py-3">
        <div className="w-full h-[200px] rounded-2xl bg-orange-100 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-300 opacity-50" />
            <div className="relative h-full flex items-center justify-between px-6">
                <div className="flex-1 space-y-4">
                    <div className="h-8 w-3/4 bg-white/50 rounded-lg" />
                    <div className="h-10 w-32 bg-gray-200/50 rounded-xl" />
                </div>
                <div className="w-[140px] h-[140px] bg-white/30 rounded-full" />
            </div>
        </div>
    </div>
);

export const SuggestedSkeleton = () => (
    <div className="mb-12">
        <div className="flex items-center justify-between mb-6 px-4">
            <SkeletonBase className="w-48 h-6 rounded-lg" />
            <SkeletonBase className="w-16 h-4 rounded-lg" />
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 pb-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 bg-white rounded-[2rem] p-3 border border-gray-100 shadow-sm">
                    <SkeletonBase className="aspect-[16/10] rounded-2xl mb-3" />
                    <div className="px-1 space-y-2">
                        <SkeletonBase className="w-3/4 h-5 rounded-lg" />
                        <div className="flex justify-between">
                            <SkeletonBase className="w-1/4 h-3 rounded-lg" />
                            <SkeletonBase className="w-1/4 h-3 rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const NewRestaurantsSkeleton = () => (
    <div className="mb-12">
        <div className="flex items-center justify-between mb-6 px-4">
            <SkeletonBase className="w-56 h-6 rounded-lg" />
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 pb-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
                    <SkeletonBase className="aspect-video rounded-2xl mb-3" />
                    <SkeletonBase className="w-3/4 h-5 rounded-lg mb-2" />
                    <SkeletonBase className="w-1/2 h-3 rounded-lg" />
                </div>
            ))}
        </div>
    </div>
);

export const RestaurantCardSkeleton = () => (
    <RestaurantCard isLoading />
);

export const RestaurantGridSkeleton = () => (
    <section className="mb-20 px-4">
        <div className="flex items-center justify-between mb-6">
            <SkeletonBase className="w-48 h-6 rounded-lg" />
            <SkeletonBase className="w-24 h-4 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
            {[...Array(4)].map((_, i) => (
                <RestaurantCardSkeleton key={i} />
            ))}
        </div>
    </section>
);
