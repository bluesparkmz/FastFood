'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant } from '@/types/fastfood';
import toast from 'react-hot-toast';

interface HomeContextType {
    restaurants: Restaurant[];
    pagedRestaurants: Restaurant[];
    exploreData: any;
    loading: boolean;
    loadingMore: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedProvince: string;
    setSelectedProvince: (province: string) => void;
    refreshData: () => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: React.ReactNode }) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [pagedRestaurants, setPagedRestaurants] = useState<Restaurant[]>([]);
    const [exploreData, setExploreData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const LIMIT = 10;

    const fetchData = useCallback(async (forced = false) => {
        if (hasLoadedInitially && !forced && !searchQuery && !selectedCategory && !selectedProvince && exploreData) {
            return;
        }

        try {
            setLoading(true);
            setPage(0);
            setHasMore(true);

            if (searchQuery) {
                const results = await fastfoodApi.searchAll(searchQuery);
                setRestaurants(results.restaurants);
                setPagedRestaurants([]);
            } else if (selectedCategory || selectedProvince) {
                const params: any = {};
                if (selectedCategory) params.category = selectedCategory;
                if (selectedProvince) params.province = selectedProvince;
                const restaurantData = await fastfoodApi.searchRestaurants(params);
                setRestaurants(restaurantData);
                setPagedRestaurants([]);
            } else {
                const [explore, allRes] = await Promise.all([
                    fastfoodApi.getExploreFeed(),
                    fastfoodApi.getRestaurants(0, LIMIT)
                ]);
                setExploreData(explore);
                setRestaurants(explore.popular_restaurants);
                setPagedRestaurants(allRes);
                if (allRes.length < LIMIT) setHasMore(false);
            }
            setHasLoadedInitially(true);
        } catch (error: any) {
            console.error('Error fetching home data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, selectedProvince, hasLoadedInitially, exploreData]);

    const loadMore = async () => {
        if (loadingMore || !hasMore || searchQuery || selectedCategory || selectedProvince) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const skip = nextPage * LIMIT;
            const moreRes = await fastfoodApi.getRestaurants(skip, LIMIT);

            if (moreRes.length < LIMIT) {
                setHasMore(false);
            }

            setPagedRestaurants(prev => [...prev, ...moreRes]);
            setPage(nextPage);
        } catch (error) {
            console.error('Error loading more restaurants:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refreshData = () => fetchData(true);

    return (
        <HomeContext.Provider value={{
            restaurants,
            pagedRestaurants,
            exploreData,
            loading,
            loadingMore,
            searchQuery,
            setSearchQuery,
            selectedCategory,
            setSelectedCategory,
            selectedProvince,
            setSelectedProvince,
            refreshData,
            loadMore,
            hasMore
        }}>
            {children}
        </HomeContext.Provider>
    );
}

export function useHome() {
    const context = useContext(HomeContext);
    if (context === undefined) {
        throw new Error('useHome must be used within a HomeProvider');
    }
    return context;
}
