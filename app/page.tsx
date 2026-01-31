'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Star, TrendingUp, Utensils,
  UtensilsCrossed, X, Menu, Bell,
  Navigation, ShoppingBag, Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import RestaurantCard from '@/components/fastfood/RestaurantCard';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant } from '@/types/fastfood';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import PromoBanner from '@/components/fastfood/PromoBanner';
import { getImageUrl } from '@/utils/imageUtils';

const FOOD_CATEGORIES = [
  { name: 'Tudo', icon: '🍽️', slug: '' },
  { name: 'Pizza', icon: '🍕', slug: 'Pizza' },
  { name: 'Búrguer', icon: '🍔', slug: 'Burger' },
  { name: 'Chinesa', icon: '🥡', slug: 'Chinese' },
  { name: 'Sushi', icon: '🍣', slug: 'Sushi' },
  { name: 'Italiana', icon: '🍝', slug: 'Italiana' },
  { name: 'Frango', icon: '🍗', slug: 'Chicken' },
  { name: 'Doces', icon: '🍩', slug: 'Dessert' },
];

export default function FastFoodPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [exploreData, setExploreData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedCategory, selectedProvince]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (searchQuery) {
        const results = await fastfoodApi.searchAll(searchQuery);
        setSearchResults(results);
        setRestaurants(results.restaurants);
      } else if (selectedCategory || selectedProvince) {
        const params: any = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedProvince) params.province = selectedProvince;
        const restaurantData = await fastfoodApi.searchRestaurants(params);
        setRestaurants(restaurantData);
        setSearchResults(null);
      } else {
        const explore = await fastfoodApi.getExploreFeed();
        setExploreData(explore);
        setRestaurants(explore.popular_restaurants);
        setSearchResults(null);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero / Promo Section */}
      <section className="px-6 py-4">
        <PromoBanner
          image="/images/promo_burger_banner.png"
          title="Grab Our Exclusive Discounts Now!"
          subtitle="Os melhores sabores da cidade com até 45% de desconto."
          discount="45%"
          onAction={() => router.push('/search')}
        />
      </section>

      {/* Modern Categories Grid */}
      <section className="px-6 py-8 overflow-x-auto no-scrollbar">
        <div className="flex items-start gap-6 min-w-max">
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.slug)}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 shadow-sm",
                selectedCategory === cat.slug
                  ? "bg-orange-500 text-white scale-110 shadow-lg shadow-orange-200"
                  : "bg-white text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-900"
              )}>
                {cat.icon}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                selectedCategory === cat.slug ? "text-orange-600" : "text-gray-400"
              )}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">



        {/* Popular / Suggested Restaurants Section */}
        {!searchQuery && !selectedCategory && restaurants.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                Sugeridos para Si
              </h3>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
              {restaurants.map((res: Restaurant) => (
                <Link
                  key={`sug-res-${res.id}`}
                  href={`/${res.slug}`}
                  className="flex-shrink-0 w-72 bg-white rounded-[2rem] p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3 bg-gray-100">
                    <img
                      src={getImageUrl(res.cover_image) || '/images/restaurant-placeholder.jpg'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-black text-gray-900">{(Number(res.rating) || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="px-1">
                    <h4 className="font-black text-gray-900 truncate text-base">{res.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.category || 'Restaurante'}</p>
                      <p className="text-[10px] font-black text-orange-600">{(Number(res.min_delivery_value) || 0).toFixed(0)} MT mín.</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popular Restaurants Section (Alternative view or hidden if using suggested row) */}
        {!searchQuery && !selectedCategory && exploreData?.new_restaurants?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Novos na Plataforma
              </h3>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
              {exploreData.new_restaurants.map((res: Restaurant) => (
                <Link
                  key={`new-res-${res.id}`}
                  href={`/${res.slug}`}
                  className="flex-shrink-0 w-64 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 bg-gray-100">
                    <img
                      src={getImageUrl(res.cover_image) || '/images/restaurant-placeholder.jpg'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-gray-900">
                      NEW
                    </div>
                  </div>
                  <h4 className="font-black text-gray-900 truncate">{res.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.province} • {res.district}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Restaurants Section (Visible during search/category filter) */}
        {(searchQuery || selectedCategory) && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                {searchQuery ? 'Restaurantes Encontrados' : `Restaurantes: ${selectedCategory}`}
              </h3>
              {restaurants.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {restaurants.length} Lugares
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
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
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="w-10 h-10 text-gray-300" />
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2">Sem resultados</h4>
                <p className="text-gray-400 text-sm font-medium">Não encontramos o que procura. Tente outra pesquisa.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Mobile Floating Action Button - Create Restaurant (Removed as requested) */}

      {/* Full Screen Menu - REDESIGNED */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-[101] flex flex-col shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <span className="font-black text-xl tracking-tighter">Fast<span className="text-orange-600">Food</span></span>
                </div>
                <button onClick={() => setShowMenu(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-3">
                {[
                  { icon: Navigation, label: 'Perto de Mim', path: '/nearby', color: 'orange' },
                  { icon: ShoppingBag, label: 'Meus Pedidos', path: '/orders', color: 'red' },
                  // { icon: LayoutDashboard, label: 'Gerenciar Vendas', path: '/restaurant-orders', color: 'orange' },
                  // { icon: TrendingUp, label: 'Estatísticas', path: '/sales', color: 'emerald' },
                  // { icon: Settings, label: 'Configurações', path: '/settings', color: 'gray' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { router.push(item.path); setShowMenu(false); }}
                    className="w-full flex items-center gap-4 p-5 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
                  >
                    <div className={cn("w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform")}>
                      <item.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <span className="font-black text-sm text-gray-900 uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-8 border-t border-gray-50">
                <div className="bg-orange-500 rounded-3xl p-6 text-white text-center shadow-orange-200 shadow-2xl relative overflow-hidden group cursor-pointer">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Parceiro SkyVenda</p>
                  <h4 className="text-lg font-black mb-4">Seja um Vendedor</h4>
                  <p className="text-xs font-bold opacity-90">Acesse o SkyPDV para gerenciar seu restaurante.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
