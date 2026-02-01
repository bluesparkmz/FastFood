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
    detectLocation: () => Promise<void>;
    isLocating: boolean;
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
    const [isLocating, setIsLocating] = useState(false);
    const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const LIMIT = 10;

    const normalizeProvince = (addr: any): string => {
        const state = addr.state || addr.region || addr.province || '';
        const lowercaseState = state.toLowerCase();

        if (lowercaseState.includes('maputo cidade') || lowercaseState === 'maputo capital') return 'Maputo Cidade';
        if (lowercaseState.includes('maputo')) return 'Maputo';
        if (lowercaseState.includes('gaza')) return 'Gaza';
        if (lowercaseState.includes('inhambane')) return 'Inhambane';
        if (lowercaseState.includes('sofala')) return 'Sofala';
        if (lowercaseState.includes('manica')) return 'Manica';
        if (lowercaseState.includes('tete')) return 'Tete';
        if (lowercaseState.includes('zambezia')) return 'Zambézia';
        if (lowercaseState.includes('nampula')) return 'Nampula';
        if (lowercaseState.includes('niassa')) return 'Niassa';
        if (lowercaseState.includes('cabo delgado')) return 'Cabo Delgado';

        return '';
    };

    const detectLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            console.log('Geolocation not supported');
            return;
        }

        try {
            setIsLocating(true);
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
            const data = await res.json();

            if (data.address) {
                const province = normalizeProvince(data.address);
                if (province) {
                    setSelectedProvince(province);
                    toast.success(`Localização detectada: ${province}`, { id: 'loc-detect' });
                }
            }
        } catch (error) {
            console.error('Error detecting location:', error);
            // Don't show toast error as user might have denied permission which is normal
        } finally {
            setIsLocating(false);
        }
    }, []);

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
            } else if (selectedCategory || (selectedProvince && forced)) {
                const params: any = {};
                if (selectedCategory) params.category = selectedCategory;
                if (selectedProvince) params.province = selectedProvince;
                const restaurantData = await fastfoodApi.searchRestaurants(params);
                setRestaurants(restaurantData);
                setPagedRestaurants([]);
            } else {
                const [explore, allRes] = await Promise.all([
                    fastfoodApi.getExploreFeed(selectedProvince || undefined),
                    fastfoodApi.getRestaurants(0, LIMIT, selectedProvince || undefined)
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
        if (loadingMore || !hasMore || searchQuery || selectedCategory) return;
        // If province is selected but we are in "Explore" mode (no category), pagedRestaurants should probably also filter by province.
        // But for now let's keep it simple.

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const skip = nextPage * LIMIT;
            const moreRes = await fastfoodApi.getRestaurants(skip, LIMIT, selectedProvince || undefined);

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
        if (!hasLoadedInitially) {
            detectLocation().finally(() => fetchData());
        }
    }, [detectLocation, hasLoadedInitially, fetchData]);

    useEffect(() => {
        if (hasLoadedInitially) {
            fetchData();
        }
    }, [searchQuery, selectedCategory, selectedProvince]);

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
            hasMore,
            detectLocation,
            isLocating
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
