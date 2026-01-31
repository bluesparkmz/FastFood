'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Settings, ToggleLeft, ToggleRight, TrendingUp, Utensils, LayoutDashboard, Store } from 'lucide-react';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant } from '@/types/fastfood';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyRestaurantsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) {
      toast.error('Você precisa fazer login primeiro');
      router.push('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  const fetchMyRestaurants = async () => {
    try {
      setLoading(true);
      // Buscar apenas restaurantes do usuário logado
      const myRestaurants = await fastfoodApi.getMyRestaurants();
      setRestaurants(myRestaurants);

      // Auto-redirect to the first restaurant's manager dashboard if exists
      if (myRestaurants.length > 0) {
        toast.success(`Redirecionando para ${myRestaurants[0].name}...`);
        router.push(`/fastfood/manage/${myRestaurants[0].id}`);
        return;
      }
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        router.push('/login');
      } else {
        toast.error(error.userMessage || 'Erro ao carregar restaurantes');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async (restaurantId: number) => {
    try {
      const result = await fastfoodApi.toggleRestaurantStatus(restaurantId);
      toast.success(`Restaurante ${result.is_open ? 'aberto' : 'fechado'} com sucesso!`);
      // Update local state for immediate feedback
      setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, is_open: result.is_open } : r));
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error(error.userMessage || 'Erro ao alterar status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Premium Compact Header */}
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
            <h1 className="text-lg font-black tracking-tight text-gray-900 leading-tight">
              Meus <span className="text-orange-600">Negócios</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Gestão de Restaurantes</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/fastfood/manage')}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Restaurante</span>
        </button>
      </header>

      {/* Hero / Welcome Message */}
      <section className="pt-24 pb-8 px-4 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
              Bem-vindo ao seu <br /><span className="text-orange-600">Dashboard</span>
            </h2>
            <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-wide">Gerencie suas vendas e cardápios</p>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm">
            <Store className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] shadow-sm h-64 animate-pulse p-6">
                <div className="h-6 bg-gray-100 rounded-xl w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded-xl w-1/2 mb-8"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                  <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 px-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-10 h-10 text-gray-200" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2 leading-tight">Nenhum restaurante<br />ainda registrado</h4>
            <p className="text-gray-400 text-sm font-medium mb-8">Crie seu primeiro restaurante hoje e comece a vender no Fastfood.</p>
            <button
              onClick={() => router.push('/fastfood/manage')}
              className="bg-orange-600 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Criar Agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2.5rem] shadow-soft border border-gray-50 overflow-hidden flex flex-col group hover:shadow-xl transition-all"
              >
                {/* Cover Image */}
                <div className="h-32 bg-gray-100 relative overflow-hidden">
                  {restaurant.cover_image ? (
                    <img
                      src={restaurant.cover_image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Store className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
                      {restaurant.category || "General"}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div>
                      <h3 className="font-black text-lg text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={cn("w-2 h-2 rounded-full", restaurant.is_open ? "bg-green-500 shadow-green-500/50" : "bg-gray-300")} />
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", restaurant.is_open ? "text-green-600" : "text-gray-400")}>
                          {restaurant.is_open ? 'Funcionando' : 'Fechado'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleRestaurantStatus(restaurant.id)}
                      className={cn(
                        "p-1.5 rounded-2xl transition-all border shadow-sm",
                        restaurant.is_open
                          ? "bg-green-50 border-green-100 text-green-600"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                      )}
                    >
                      {restaurant.is_open ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                    </button>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="bg-orange-50/50 rounded-2xl p-4 flex items-center justify-between border border-orange-50">
                      <div>
                        <span className="block text-[8px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Avaliação Geral</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                          <span className="text-sm font-black text-gray-900">{(Number(restaurant.rating) || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Pedidos Mín.</span>
                        <span className="text-sm font-black text-gray-900">{(Number(restaurant.min_delivery_value) || 0).toFixed(2)}MT</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Grid */}
                  <div className="grid grid-cols-3 gap-3 mt-auto">
                    <button
                      onClick={() => router.push(`/fastfood/manage/${restaurant.id}`)}
                      className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-100 hover:bg-gray-800 transition-all active:scale-95"
                    >
                      <Settings className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => router.push(`/fastfood/manage/${restaurant.id}/dashboard`)}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <Utensils className="w-4 h-4" />
                      Cardápio
                    </button>
                    <button
                      onClick={() => router.push(`/fastfood/manage/${restaurant.id}/stats`)}
                      className="flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Vendas
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Re-using some icons to avoid missing imports error
function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
