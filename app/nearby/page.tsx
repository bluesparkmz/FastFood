'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Loader2, Navigation, AlertCircle, ChevronLeft, Settings, Info, Zap, UtensilsCrossed } from 'lucide-react';
import RestaurantCard from '@/components/fastfood/RestaurantCard';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant } from '@/types/fastfood';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
  latitude: number;
  longitude: number;
}

export default function NearbyRestaurantsPage() {
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState<string>('');
  const [radius, setRadius] = useState<number>(5); // km
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para calcular distância entre dois pontos (fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Extrair coordenadas do Google Maps link
  const extractCoordinates = (googleMapsLink: string): { lat: number; lng: number } | null => {
    if (!googleMapsLink) return null;
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
    ];
    for (const pattern of patterns) {
      const match = googleMapsLink.match(pattern);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
    }
    return null;
  };

  const getUserLocation = () => {
    setGettingLocation(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada pelo seu navegador');
      setGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        setGettingLocation(false);
        searchNearbyRestaurants(newLocation);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED: errorMessage = 'Permissão de localização negada'; break;
          case error.POSITION_UNAVAILABLE: errorMessage = 'Localização indisponível'; break;
          case error.TIMEOUT: errorMessage = 'Timeout ao obter localização'; break;
        }
        setError(errorMessage);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const searchNearbyRestaurants = async (userLocation: Location) => {
    try {
      setLoading(true);
      const allRestaurants = await fastfoodApi.getRestaurants(0, 1000);
      const restaurantsWithDistance = allRestaurants
        .map(restaurant => {
          if (!restaurant.location_google_maps) return null;
          const coords = extractCoordinates(restaurant.location_google_maps);
          if (!coords) return null;
          const distance = calculateDistance(userLocation.latitude, userLocation.longitude, coords.lat, coords.lng);
          return { ...restaurant, distance, coordinates: coords };
        })
        .filter((r): r is any => r !== null && r.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
      setRestaurants(restaurantsWithDistance as any);
    } catch (error: any) {
      console.error('Error searching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) searchNearbyRestaurants(location);
  }, [radius]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Compact Premium Header */}
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 py-3 flex items-center justify-between",
          isScrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm" : "bg-white"
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight text-gray-900">
              Perto de <span className="text-orange-600">Mim</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Localização Automática</p>
          </div>
        </div>

        <button className="p-2 rounded-xl bg-gray-50 text-gray-400">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Hero / Control Section */}
      <section className="pt-24 pb-8 px-4 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          {!location && !gettingLocation ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-50 rounded-3xl p-6 relative overflow-hidden group mb-4"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-500/20 transition-all" />
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-100">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900">Encontre Comida Perto</h3>
                  <p className="text-xs text-orange-600/70 font-bold uppercase tracking-widest">Precisamos da sua permissão</p>
                </div>
              </div>
              <button
                onClick={getUserLocation}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-95 transition-all"
              >
                Ativar Localização
              </button>
            </motion.div>
          ) : gettingLocation ? (
            <div className="bg-orange-50 rounded-3xl p-8 text-center border-2 border-dashed border-orange-100 animate-pulse">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="font-black text-gray-900 uppercase text-xs tracking-widest">Buscando sua posição...</p>
            </div>
          ) : location ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm mb-4"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 fill-green-600" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Área</span>
                    <span className="font-black text-gray-900 text-sm">Pronto para buscar</span>
                  </div>
                </div>
                <button onClick={getUserLocation} className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-4 py-2 rounded-xl">Recarregar</button>
              </div>

              {/* Radius Control */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Raio de Cobertura</span>
                    <span className="text-2xl font-black text-gray-900">{radius}<span className="text-xs text-orange-600 ml-1 uppercase">km</span></span>
                  </div>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-[9px] font-black text-gray-300 uppercase tracking-tighter mt-2">
                    <span>1 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-xs font-bold text-red-800">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Search Results */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {!location && !gettingLocation ? (
          <div className="text-center py-20 opacity-30">
            <UtensilsCrossed className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <p className="font-black uppercase text-xs tracking-[0.3em]">Aguardando coordenadas</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[1.5rem] shadow-sm h-48 animate-pulse p-4 flex gap-4">
                <div className="w-48 bg-gray-100 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <Info className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h4 className="text-lg font-black text-gray-900">Nada encontrado</h4>
            <p className="text-gray-400 text-sm font-medium px-8">Nenhum restaurante no raio de {radius}km. Tente aumentar a distância.</p>
            <button
              onClick={() => setRadius(prev => Math.min(prev + 5, 50))}
              className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Aumentar para {Math.min(radius + 5, 50)}km
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {restaurants.length} {restaurants.length === 1 ? 'Restaurante' : 'Restaurantes'}
              </h2>
              <span className="text-xs font-bold text-gray-400">Perto de você</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {restaurants.map((restaurant: any) => (
                <div key={restaurant.id} className="relative group/nearby">
                  <RestaurantCard restaurant={restaurant} />
                  {restaurant.distance && (
                    <a
                      href={restaurant.location_google_maps || `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2 right-2 bg-white text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transform group-hover/nearby:scale-110 transition-all hover:bg-indigo-600 hover:text-white z-10"
                    >
                      {restaurant.distance.toFixed(1)} km
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
