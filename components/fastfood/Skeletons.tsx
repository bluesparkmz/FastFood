'use client';

import React from 'react';

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
    <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden flex flex-row h-full p-0">
        <SkeletonBase className="w-32 sm:w-40 md:w-56 lg:w-64 flex-shrink-0 rounded-none" />
        <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                    <div className="space-y-2 w-full">
                        <SkeletonBase className="w-1/4 h-3 rounded-lg" />
                        <SkeletonBase className="w-3/4 h-6 rounded-lg" />
                    </div>
                    <SkeletonBase className="w-12 h-6 rounded-lg flex-shrink-0" />
                </div>
                <div className="flex gap-4">
                    <SkeletonBase className="w-20 h-3 rounded-lg" />
                    <SkeletonBase className="w-20 h-3 rounded-lg" />
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="space-y-1">
                    <SkeletonBase className="w-16 h-2 rounded-lg" />
                    <SkeletonBase className="w-24 h-4 rounded-lg" />
                </div>
                <SkeletonBase className="w-10 h-10 rounded-xl" />
            </div>
        </div>
    </div>
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
