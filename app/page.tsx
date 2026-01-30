'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, MapPin, Plus, Menu, X, UtensilsCrossed, Settings, ShoppingBag, TrendingUp, LayoutDashboard, Navigation, Utensils, Heart, ChevronRight, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import RestaurantCard from '@/components/fastfood/RestaurantCard';
import FoodFeedCard from '@/components/fastfood/FoodFeedCard';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant, CatalogProduct } from '@/types/fastfood';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

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
  const [featuredItems, setFeaturedItems] = useState<{ item: CatalogProduct, restaurant: Restaurant }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedCategory, selectedProvince]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedProvince) params.province = selectedProvince;

      const restaurantData = await fastfoodApi.searchRestaurants(params);
      setRestaurants(restaurantData);

      // Collect some menu items for the "Food Feed"
      // In a real app, we might have a dedicated endpoint for featured items.
      // Here we simulate by taking the first few items from the first restaurants.
      const items: { item: CatalogProduct, restaurant: Restaurant }[] = [];
      const fetchItemsPromises = restaurantData.slice(0, 5).map(async (res) => {
        try {
          const catalog = await fastfoodApi.getCatalog(res.id);
          if (catalog.length > 0) {
            catalog.slice(0, 2).forEach(item => {
              items.push({ item, restaurant: res });
            });
          }
        } catch (e) { }
      });
      await Promise.all(fetchItemsPromises);
      setFeaturedItems(items);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.userMessage || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Premium Compact Header */}
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 py-3 flex items-center justify-between",
          isScrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm" : "bg-transparent"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-orange-200 shadow-lg">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className={cn("text-lg font-black tracking-tight transition-colors", isScrolled ? "text-gray-900" : "text-gray-900")}>
              SkyVenda <span className="text-orange-600 font-extrabold uppercase text-sm">Food</span>
            </h1>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
              <MapPin className="w-3 h-3 text-orange-500" />
              <span>Maputo, MZ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 rounded-xl bg-gray-900 text-white shadow-xl"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="pt-28 pb-8 px-4 bg-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />

        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
            O que vamos <span className="text-orange-500">comer</span> <br />hoje? 😋
          </h2>

          {/* Premium Search Bar */}
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-orange-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] p-1 shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
              <div className="pl-5">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Pizza, burguer, restaurante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-4 px-4 text-sm font-bold placeholder:text-gray-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Slider */}
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4">
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all",
                  selectedCategory === cat.slug
                    ? "bg-orange-500 text-white shadow-orange-200 shadow-lg scale-105"
                    : "bg-gray-50 text-gray-400 hover:bg-white hover:text-orange-500 hover:shadow-sm"
                )}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* The "Food Feed" - Featured Items */}
        {featuredItems.length > 0 && !selectedCategory && !searchQuery && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                Recomendado para Si
              </h3>
              <Link href="/nearby" className="text-xs font-black text-orange-600 flex items-center gap-1 hover:underline">
                Ver Todos <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.slice(0, 3).map((itemData, idx) => (
                <FoodFeedCard
                  key={`${itemData.restaurant.id}-${itemData.item.id}`}
                  item={itemData.item}
                  restaurantName={itemData.restaurant.name}
                  onClick={() => router.push(`/${itemData.restaurant.id}#item-${itemData.item.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Restaurants Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              {loading ? 'Buscando...' : 'Restaurantes'}
            </h3>
            {restaurants.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-black text-gray-500 uppercase">
                {restaurants.length} Lugares
              </span>
            )}
          </div>

          {loading ? (
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
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-2">Sem resultados</h4>
              <p className="text-gray-400 text-sm font-medium">Não encontramos restaurantes com estes filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>
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
                  <span className="font-black text-xl tracking-tighter">FastMenu</span>
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
