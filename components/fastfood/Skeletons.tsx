'use client';

import React from 'react';
import RestaurantCard from './RestaurantCard';

const SkeletonBase = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export const CategorySkeleton = () => (
    <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 py-8">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[300px] h-[350px] bg-gray-200 rounded-[2.5rem] animate-pulse" />
        ))}
    </div>
);

export const HeroSkeleton = () => (
    <div className="w-full h-[200px] md:h-[350px] lg:h-[400px] rounded-[2.5rem] md:rounded-[3rem] bg-gray-200 animate-pulse" />
);

export const SuggestedSkeleton = () => (
    <div className="mb-12 px-4">
        <div className="flex justify-between mb-6">
            <div className="w-48 h-6 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 h-[280px] bg-gray-200 rounded-[2rem] animate-pulse" />
            ))}
        </div>
    </div>
);

export const NewRestaurantsSkeleton = () => (
    <div className="mb-12 px-4">
        <div className="w-56 h-6 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 h-[180px] bg-gray-200 rounded-3xl animate-pulse" />
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
