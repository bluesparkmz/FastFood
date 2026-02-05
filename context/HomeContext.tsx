'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant } from '@/types/fastfood';

interface HomeContextType {
    restaurants: Restaurant[];
    pagedRestaurants: Restaurant[];
    exploreData: any;
    loading: boolean;
    loadingHero: boolean;
    loadingPopular: boolean;
    loadingNew: boolean;
    loadingDistrict: boolean;
    loadingPaged: boolean;
    loadingMore: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedProvince: string;
    setSelectedProvince: (province: string) => void;
    selectedDistrict: string;
    setSelectedDistrict: (district: string) => void;
    districtRestaurants: Restaurant[];
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
    const [loadingHero, setLoadingHero] = useState(true);
    const [loadingPopular, setLoadingPopular] = useState(false);
    const [loadingNew, setLoadingNew] = useState(false);
    const [loadingDistrict, setLoadingDistrict] = useState(false);
    const [loadingPaged, setLoadingPaged] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [districtRestaurants, setDistrictRestaurants] = useState<Restaurant[]>([]);
    const [isLocating, setIsLocating] = useState(false);
    const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const isFetchingRef = useRef(false);

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

            // Try high accuracy first with a shorter timeout
            const getPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
                return new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, options);
                });
            };

            let position: GeolocationPosition;
            try {
                position = await getPosition({
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            } catch (e) {
                console.warn('High accuracy geolocation timed out or failed, trying low accuracy...');
                position = await getPosition({
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: Infinity
                });
            }

            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);

            if (!res.ok) throw new Error('Failed to fetch address');

            const data = await res.json();
            if (data.address) {
                const province = normalizeProvince(data.address);
                const district = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.municipality || '';

                if (province) {
                    setSelectedProvince(province);
                }
                if (district) {
                    setSelectedDistrict(district);
                }

                if (province || district) {
                    const locationMsg = district ? `${district}, ${province}` : province;
                    console.log(`Localização detectada: ${locationMsg}`);
                }
            }
        } catch (error) {
            console.error('Error detecting location:', error);
        } finally {
            setIsLocating(false);
        }
    }, []);

    const fetchData = useCallback(async (forced = false) => {
        if (isFetchingRef.current) return;

        if (hasLoadedInitially && !forced && !searchQuery && !selectedCategory && !selectedProvince && !selectedDistrict && exploreData) {
            return;
        }

        try {
            isFetchingRef.current = true;
            // General loading state for search/category filters
            if (searchQuery || selectedCategory) {
                setLoading(true);
            }

            setPage(0);
            setHasMore(true);

            if (searchQuery) {
                const results = await fastfoodApi.searchAll(searchQuery);
                setRestaurants(results.restaurants);
                setPagedRestaurants([]);
                setExploreData(null);
                setLoading(false);
            } else if (selectedCategory || (selectedProvince && forced)) {
                const params: any = {};
                if (selectedCategory) params.category = selectedCategory;
                if (selectedProvince) params.province = selectedProvince;
                const restaurantData = await fastfoodApi.searchRestaurants(params);
                setRestaurants(restaurantData);
                setPagedRestaurants([]);
                setExploreData(null);
                setLoading(false);
            } else {
                // INDEPENDENT LOADS FOR SECTIONS
                setLoadingPopular(true);
                setLoadingNew(true);
                setLoadingPaged(true);
                setLoadingDistrict(!!selectedDistrict);

                // Popular Section
                const fetchPopular = async () => {
                    try {
                        const popular = await fastfoodApi.getPopularRestaurants({
                            province: selectedProvince || undefined,
                            limit: 6
                        });
                        setExploreData((prev: any) => ({ ...prev, popular_restaurants: popular }));
                        setRestaurants(popular);
                    } finally {
                        setLoadingPopular(false);
                    }
                };

                // New Section
                const fetchNew = async () => {
                    try {
                        const newRes = await fastfoodApi.getNewRestaurants({
                            province: selectedProvince || undefined,
                            limit: 6
                        });
                        setExploreData((prev: any) => ({ ...prev, new_restaurants: newRes }));
                    } finally {
                        setLoadingNew(false);
                    }
                };

                // Paged Section (Main Feed)
                const fetchPaged = async () => {
                    try {
                        const allRes = await fastfoodApi.getRestaurants(0, LIMIT, selectedProvince || undefined);
                        setPagedRestaurants(allRes);
                        if (allRes.length < LIMIT) setHasMore(false);
                    } finally {
                        setLoadingPaged(false);
                    }
                };

                // District Section
                const fetchDistrict = async () => {
                    if (!selectedDistrict) {
                        setDistrictRestaurants([]);
                        setLoadingDistrict(false);
                        return;
                    }
                    try {
                        const distRes = await fastfoodApi.getNearbyRestaurants({
                            district: selectedDistrict,
                            province: selectedProvince || undefined,
                            limit: 6
                        });
                        setDistrictRestaurants(distRes);
                    } finally {
                        setLoadingDistrict(false);
                    }
                };

                // Trigger all in parallel without blocking each other
                fetchPopular();
                fetchNew();
                fetchPaged();
                fetchDistrict();

                // Set overall loading to false once triggers are out
                setLoading(false);
            }
            setHasLoadedInitially(true);
        } catch (error: any) {
            console.error('Error fetching home data:', error);
            setLoading(false);
            setLoadingPopular(false);
            setLoadingNew(false);
            setLoadingPaged(false);
            setLoadingDistrict(false);
        } finally {
            isFetchingRef.current = false;
        }
    }, [searchQuery, selectedCategory, selectedProvince, selectedDistrict, hasLoadedInitially, exploreData]);

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
            // Emulate hero loading for 2 seconds
            const timer = setTimeout(() => {
                setLoadingHero(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [detectLocation, hasLoadedInitially, fetchData]);

    useEffect(() => {
        if (hasLoadedInitially) {
            fetchData();
        }
    }, [searchQuery, selectedCategory, selectedProvince, selectedDistrict]);

    const refreshData = () => fetchData(true);

    return (
        <HomeContext.Provider value={{
            restaurants,
            pagedRestaurants,
            exploreData,
            loading,
            loadingHero,
            loadingPopular,
            loadingNew,
            loadingDistrict,
            loadingPaged,
            loadingMore,
            searchQuery,
            setSearchQuery,
            selectedCategory,
            setSelectedCategory,
            selectedProvince,
            setSelectedProvince,
            selectedDistrict,
            setSelectedDistrict,
            districtRestaurants,
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
