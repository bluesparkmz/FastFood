'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant } from '@/types/fastfood';
import toast from 'react-hot-toast';

interface HomeContextType {
    restaurants: Restaurant[];
    exploreData: any;
    loading: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedProvince: string;
    setSelectedProvince: (province: string) => void;
    refreshData: () => Promise<void>;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: React.ReactNode }) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [exploreData, setExploreData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

    const fetchData = useCallback(async (forced = false) => {
        // Only avoid fetching if we have data and it's not a forced refresh
        if (hasLoadedInitially && !forced && !searchQuery && !selectedCategory && !selectedProvince && exploreData) {
            return;
        }

        try {
            setLoading(true);
            if (searchQuery) {
                const results = await fastfoodApi.searchAll(searchQuery);
                setRestaurants(results.restaurants);
            } else if (selectedCategory || selectedProvince) {
                const params: any = {};
                if (selectedCategory) params.category = selectedCategory;
                if (selectedProvince) params.province = selectedProvince;
                const restaurantData = await fastfoodApi.searchRestaurants(params);
                setRestaurants(restaurantData);
            } else {
                const explore = await fastfoodApi.getExploreFeed();
                setExploreData(explore);
                setRestaurants(explore.popular_restaurants);
            }
            setHasLoadedInitially(true);
        } catch (error: any) {
            console.error('Error fetching home data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, selectedProvince, hasLoadedInitially, exploreData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refreshData = () => fetchData(true);

    return (
        <HomeContext.Provider value={{
            restaurants,
            exploreData,
            loading,
            searchQuery,
            setSearchQuery,
            selectedCategory,
            setSelectedCategory,
            selectedProvince,
            setSelectedProvince,
            refreshData
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
