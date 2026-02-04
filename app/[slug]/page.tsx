'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, MapPin, Star, ShoppingCart,
  Navigation, ChevronLeft, ChevronRight, CheckCircle,
  XCircle, Search, Plus, Minus, Info, Share2
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import fastfoodApi from '@/api/fastfoodApi';
import type { Restaurant, FastFoodOrder, RestaurantTable, Tab, CatalogProduct } from '@/types/fastfood';
import toast from 'react-hot-toast';
import { getImageUrl, getMultipleImageUrls, isEmoji } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';
import { useHome } from '@/context/HomeContext';
import { useAuth } from '@/context/AuthContext';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.slug as string;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [cart, setCart] = useState<Map<string, any>>(new Map());
  const [orderType, setOrderType] = useState<'local' | 'distance'>('local');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'skywallet' | 'pos' | 'mpesa'>('cash');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [userDistance, setUserDistance] = useState<number | null>(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copying, setCopying] = useState(false);

  const { restaurants, pagedRestaurants } = useHome();
  const { isLoggedIn } = useAuth();

  // Tab and Table selection (for local orders)
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showTabModal, setShowTabModal] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabPhone, setNewTabPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Parallax Header Config
  const headerHeight = useTransform(scrollY, [0, 200], [320, 200]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.9]);
  const contentY = useTransform(scrollY, [0, 200], [0, -20]);

  useEffect(() => {
    if (restaurantSlug) {
      fetchRestaurant();
    }
  }, [restaurantSlug]);

  useEffect(() => {
    if (restaurant?.latitude && restaurant?.longitude && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const dist = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          restaurant.latitude!,
          restaurant.longitude!
        );
        setUserDistance(dist);
      }, (err) => {
        console.error("Geolocation error:", err);
      });
    }
  }, [restaurant]);

  const fetchRestaurant = async () => {
    try {
      // Try to find in context first
      const contextRestaurant = [...restaurants, ...pagedRestaurants].find(r => r.slug === restaurantSlug);

      if (contextRestaurant) {
        setRestaurant(contextRestaurant);
        setLoading(false);
      } else {
        setLoading(true);
      }

      setLoadingCatalog(true);

      // If we don't have it in context, fetch it
      let restaurantData = contextRestaurant;
      if (!restaurantData) {
        restaurantData = await fastfoodApi.getRestaurantBySlug(restaurantSlug);
        setRestaurant(restaurantData);
        setLoading(false);
      }

      // Fetch catalog
      const catalogData = await fastfoodApi.getCatalog(restaurantData.id);
      setCatalog(catalogData);

      if (catalogData.length > 0) {
        // Find unique categories
        const categories = Array.from(new Set(catalogData.map(i => i.category).filter(Boolean)));
        if (categories.length > 0) {
          setActiveCategory('all');
        }
      }
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      toast.error('Erro ao carregar restaurante');
    } finally {
      setLoading(false);
      setLoadingCatalog(false);
    }
  };

  const addToCart = (itemId: number, itemPrice: number, itemName: string) => {
    const key = `product_${itemId}`;
    const newCart = new Map(cart);

    if (newCart.has(key)) {
      const item = newCart.get(key)!;
      newCart.set(key, { ...item, quantity: item.quantity + 1 });
    } else {
      newCart.set(key, {
        item_type: 'menu_item', // Default to menu_item for catalog products
        item_id: itemId,
        quantity: 1,
        price: itemPrice,
        name: itemName
      });
    }

    setCart(newCart);
    toast.success('Adicionado ao pedido', {
      icon: '🛒',
      position: 'bottom-center',
      style: {
        borderRadius: '24px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const removeFromCart = (itemId: number) => {
    const key = `product_${itemId}`;
    const newCart = new Map(cart);

    if (newCart.has(key)) {
      const item = newCart.get(key)!;
      if (item.quantity > 1) {
        newCart.set(key, { ...item, quantity: item.quantity - 1 });
      } else {
        newCart.delete(key);
      }
    }

    setCart(newCart);
  };

  const getCartQuantity = (itemId: number) => {
    const key = `product_${itemId}`;
    return cart.get(key)?.quantity || 0;
  };

  const calculateTotal = () => {
    if (!restaurant) return 0;
    let total = 0;

    cart.forEach((item) => {
      total += (item.price || 0) * item.quantity;
    });

    return total;
  };

  // Load tabs and tables when orderType is local
  useEffect(() => {
    if (orderType === 'local' && restaurant?.id && isLoggedIn) {
      const loadTabsAndTables = async () => {
        try {
          const [tabsData, tablesData] = await Promise.all([
            fastfoodApi.getTabs(restaurant.id, 'open'),
            fastfoodApi.getTables(restaurant.id)
          ]);
          setTabs(tabsData);
          setTables(tablesData);
        } catch (error) {
          console.error('Error loading tabs/tables:', error);
        }
      };
      loadTabsAndTables();
    }
  }, [orderType, restaurant?.id, isLoggedIn]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchResults = normalizedSearch
    ? catalog.filter(i =>
      i.name.toLowerCase().includes(normalizedSearch) ||
      (i.description && i.description.toLowerCase().includes(normalizedSearch))
    )
    : catalog;

  const suggestionResults = catalog.slice(0, 12);

  const enterSearchMode = () => {
    setIsSearchMode(true);
  };

  const exitSearchMode = () => {
    setIsSearchMode(false);
    setSearchTerm('');
  };

  const selectSearchItem = (itemId: number, itemName: string) => {
    setSearchTerm(itemName);
    setIsSearchMode(false);
    setTimeout(() => {
      const el = document.getElementById(`product-${itemId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const coverImage = restaurant?.cover_image ? getImageUrl(restaurant.cover_image) : null;
  const extraImages = getMultipleImageUrls(restaurant?.images);
  const heroImages = [coverImage, ...extraImages].filter((x): x is string => !!x);
  const activeHeroImage = heroImages.length > 0 ? heroImages[heroImageIndex % heroImages.length] : null;

  useEffect(() => {
    if (!restaurant?.id) return;
    setHeroImageIndex(0);
  }, [restaurant?.id]);

  useEffect(() => {
    if (!restaurant?.id) return;
    if (isSearchMode) return;
    if (heroImages.length <= 1) return;

    const id = window.setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => window.clearInterval(id);
  }, [restaurant?.id, heroImages.length, isSearchMode]);

  const handleCreateTab = async () => {
    if (!newTabName.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }
    try {
      const newTab = await fastfoodApi.createTab(restaurant!.id, {
        client_name: newTabName,
        client_phone: newTabPhone || undefined
      });
      setTabs([...tabs, newTab]);
      setSelectedTab(newTab.id);
      setShowTabModal(false);
      setNewTabName('');
      setNewTabPhone('');
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao criar conta');
    }
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      const next = encodeURIComponent(window.location.pathname);
      router.push(`/login?next=${next}`);
      return;
    }

    if (cart.size === 0) return;

    if (orderType === 'distance' && !deliveryAddress.trim()) {
      toast.error('Informe o endereço de entrega');
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        restaurant_id: Number(restaurant?.id),
        order_type: orderType,
        payment_method: paymentMethod,
        delivery_address: orderType === 'distance' ? deliveryAddress : undefined,
        tab_id: orderType === 'local' && selectedTab ? selectedTab : undefined,
        table_id: orderType === 'local' && selectedTable ? selectedTable : undefined,
        items: Array.from(cart.values()).map(item => ({
          item_type: item.item_type || 'menu_item',
          item_id: item.item_id,
          quantity: item.quantity
        }))
      };

      await fastfoodApi.createOrder(orderData);
      toast.success('Pedido realizado com sucesso!', {
        icon: '✅',
        style: { borderRadius: '24px' }
      });
      setCart(new Map());
      setSelectedTab(null);
      setSelectedTable(null);
      router.push('/orders');
    } catch (error: any) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.detail || 'Erro ao realizar pedido';
      toast.error(errorMessage, {
        duration: 5000,
        icon: '🚫',
        style: {
          borderRadius: '24px',
          background: '#333',
          color: '#fff',
          fontWeight: 'bold'
        },
      });
    } finally {
      setSubmitting(false);
      setIsCartOpen(false);
    }
  };

  if (loading || !restaurant) {
    return <RestaurantSkeleton />;
  }

  const isOpen = restaurant.is_open;
  const categoriesList = Array.from(new Set(catalog.map(i => i.category).filter(Boolean) as string[]));
  const hasItemsWithoutCategory = catalog.some(i => !i.category);

  const displayCategories = [...categoriesList];
  if (hasItemsWithoutCategory) {
    displayCategories.push("Geral");
  }

  const categories = [
    { id: 'all', name: 'Tudo', type: 'all' },
    ...displayCategories.map(cat => ({ id: cat, name: cat, type: 'category' }))
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans selection:bg-orange-100 selection:text-orange-900">

      {/* Hero Section - Streamlined */}
      <AnimatePresence>
        {!isSearchMode && (
          <motion.div
            key="restaurant-hero"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 300, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 30 }}
            className="relative w-full overflow-hidden"
          >
            <div className="relative w-full h-[300px] overflow-hidden">
              {activeHeroImage ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeHeroImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeHeroImage}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-full h-full bg-orange-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Floating Mini Header */}
              <div className="absolute top-0 left-0 w-full px-6 py-4 flex items-center justify-between z-20">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setShowShareDialog(true)}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-10 left-0 w-full px-6">
                <div className="max-w-7xl mx-auto flex flex-col gap-2">
                  <h1 className="text-3xl font-black text-white tracking-tight">{restaurant.name}</h1>
                  <div className="flex items-center gap-3 text-white/80 text-xs font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                      {restaurant.rating.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{restaurant.category || 'Restaurante'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div
        style={{ y: contentY }}
        animate={{
          marginTop: isSearchMode ? 0 : -24,
          borderTopLeftRadius: isSearchMode ? 0 : 40,
          borderTopRightRadius: isSearchMode ? 0 : 40,
        }}
        transition={{ type: 'spring', stiffness: 240, damping: 30 }}
        className="relative z-10 bg-gray-50 min-h-screen shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] pt-8"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar comidas ou bebidas..."
                value={searchTerm}
                onClick={enterSearchMode}
                onFocus={enterSearchMode}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-none rounded-[1.5rem] py-5 pl-16 pr-6 text-base font-bold shadow-soft shadow-black/5 focus:shadow-xl focus:shadow-orange-500/5 outline-none transition-all placeholder:text-gray-400 text-gray-900"
              />

              {isSearchMode && (
                <button
                  onClick={exitSearchMode}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                  title="Fechar"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {isSearchMode && (
              <div className="mt-4">
                {normalizedSearch && searchResults.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                    <p className="font-black uppercase text-xs tracking-[0.3em]">Nenhum item encontrado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(normalizedSearch ? searchResults.slice(0, 30) : catalog.slice(0, 12)).map((item) => (
                      <div key={item.id} id={`product-${item.id}`}>
                        <ProductCard
                          item={item}
                          quantity={getCartQuantity(item.id)}
                          onAdd={() => addToCart(item.id, item.price, item.name)}
                          onRemove={() => removeFromCart(item.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Category Navigation */}
          {!searchTerm && !isSearchMode && (
            <div className="sticky top-4 z-30 mb-8">
              <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-black/5 p-2 rounded-[1.5rem] flex overflow-x-auto gap-2 no-scrollbar scroll-smooth">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={cn(
                      "px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0",
                      activeCategory === cat.id
                        ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105"
                        : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu Sections */}
          <div className="space-y-12 pb-24">
            {loadingCatalog ? (
              <div className="space-y-12">
                {[...Array(2)].map((_, g) => (
                  <div key={g} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-8 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-4 flex gap-4 h-32 animate-pulse">
                          <div className="w-24 md:w-32 bg-gray-100 rounded-xl flex-shrink-0"></div>
                          <div className="flex-1 space-y-3 py-2">
                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-100 rounded w-full"></div>
                            <div className="h-8 bg-gray-50 rounded-xl w-24 mt-auto"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              displayCategories.map((categoryName) => {
                const itemsInCategory = catalog.filter(item =>
                  (categoryName === "Geral" && !item.category) || (item.category === categoryName)
                );
                const filteredItems = itemsInCategory.filter(item =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
                );

                if (filteredItems.length === 0) return null;

                return (
                  <section key={categoryName} id={categoryName} className="scroll-mt-32">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{categoryName}</h2>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredItems.length} ITENS</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredItems.map((item) => (
                        <div key={item.id} id={`product-${item.id}`}>
                          <ProductCard
                            item={item}
                            quantity={getCartQuantity(item.id)}
                            onAdd={() => addToCart(item.id, item.price, item.name)}
                            onRemove={() => removeFromCart(item.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })
            )}

            {/* Empty State for Catalog */}
            {!loadingCatalog && catalog.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-soft border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cardápio não disponível</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Este restaurante ainda não adicionou produtos ao cardápio digital.</p>
              </div>
            )}

            {/* Empty State for Search */}
            {searchTerm && !loadingCatalog &&
              catalog.filter(i =>
                i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()))
              ).length === 0 && (
                <div className="text-center py-20 opacity-30">
                  <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                  <p className="font-black uppercase text-xs tracking-[0.3em]">Nenhum item encontrado</p>
                </div>
              )}
          </div>
        </div>
      </motion.div>

      {/* Floating Cart Button / Bottom Sheet */}
      <AnimatePresence>
        {cart.size > 0 && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-20 inset-x-4 md:inset-x-auto md:right-8 md:w-[400px] z-40"
          >
            <div className="bg-gray-900 text-white rounded-[2rem] shadow-2xl shadow-orange-500/20 overflow-hidden border border-gray-800">
              <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setIsCartOpen(!isCartOpen)}>
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/30">
                    {Array.from(cart.values()).reduce((acc, item) => acc + item.quantity, 0)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total do Pedido</p>
                    <p className="text-xl font-black">{calculateTotal().toFixed(2)} MT</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsCartOpen(!isCartOpen); }}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all p-3 rounded-xl"
                >
                  <ChevronLeft className={cn("w-5 h-5 transition-transform duration-300", isCartOpen ? "-rotate-90" : "rotate-90")} />
                </button>
              </div>

              <AnimatePresence>
                {isCartOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-800 p-6 space-y-6 border-t border-gray-700/50">
                      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Cart Items List */}
                        {Array.from(cart.values()).map((cartItem) => {
                          const product = catalog.find(i => i.id === cartItem.item_id);

                          if (!product) return null;

                          return (
                            <div key={`product-${cartItem.item_id}`} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3">
                                {(() => {
                                  const isEmojiImage = product.image && isEmoji(product.image);
                                  const displayEmoji = isEmojiImage ? product.image : (product.emoji || (product.category?.toLowerCase() === 'drinks' ? '🥤' : '🍔'));
                                  const imageUrl = (!isEmojiImage && product.image) ? getImageUrl(product.image) : null;

                                  return imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      className="w-10 h-10 rounded-lg object-cover bg-gray-700"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                                      <span className="text-xl">{displayEmoji}</span>
                                    </div>
                                  );
                                })()}
                                <div>
                                  <p className="text-sm font-bold text-white line-clamp-1">{product.name}</p>
                                  <p className="text-xs text-gray-400">{product.price} MT</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                                <button
                                  onClick={() => removeFromCart(cartItem.item_id)}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{cartItem.quantity}</span>
                                <button
                                  onClick={() => addToCart(cartItem.item_id, product.price, product.name)}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Checkout Options */}
                      <div className="space-y-4 pt-4 border-t border-gray-700/50">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Entrega</label>
                            <select
                              value={orderType}
                              onChange={(e) => setOrderType(e.target.value as any)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
                            >
                              <option value="local">Local</option>
                              <option value="distance">Delivery</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pagamento</label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as any)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
                            >
                              <option value="cash">Dinheiro</option>
                              <option value="skywallet">SkyWallet</option>
                              <option value="pos">Card/POS</option>
                              <option value="mpesa">M-Pesa</option>
                            </select>
                          </div>
                        </div>

                        {orderType === 'distance' && (
                          <input
                            type="text"
                            placeholder="Endereço de entrega..."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-medium placeholder:text-gray-600"
                          />
                        )}

                        {orderType === 'local' && (
                          <div className="space-y-3">
                            {/* Table Selection */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mesa (Opcional)</label>
                              <select
                                value={selectedTable || ''}
                                onChange={(e) => setSelectedTable(e.target.value ? Number(e.target.value) : null)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
                              >
                                <option value="">Nenhuma mesa</option>
                                {tables.filter(t => t.status === 'available').map(table => (
                                  <option key={table.id} value={table.id}>
                                    {table.table_number} ({table.seats} lugares)
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Tab Selection */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Adicionar à Conta (Opcional)</label>
                                <button
                                  onClick={() => setShowTabModal(true)}
                                  className="text-[10px] font-bold text-orange-500 hover:text-orange-400 uppercase tracking-widest"
                                >
                                  + Nova Conta
                                </button>
                              </div>
                              <select
                                value={selectedTab || ''}
                                onChange={(e) => setSelectedTab(e.target.value ? Number(e.target.value) : null)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
                              >
                                <option value="">Nenhuma conta</option>
                                {tabs.map(tab => (
                                  <option key={tab.id} value={tab.id}>
                                    {tab.client_name} - {Number(tab.current_balance).toFixed(2)} MT
                                  </option>
                                ))}
                              </select>
                              {selectedTab && (
                                <p className="text-[10px] text-orange-400 font-medium">
                                  O pedido será adicionado à conta. O cliente pagará depois.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Final Actions */}
                      <div className="pt-2">
                        <button
                          onClick={handlePlaceOrder}
                          disabled={submitting}
                          className={cn(
                            "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                            submitting
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 active:scale-[0.98]"
                          )}
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              <span>Processando...</span>
                            </>
                          ) : (
                            <>
                              <span>Fazer Pedido</span>
                              <ShoppingCart className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Tab Modal */}
      {showTabModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-lg text-white">Nova Conta de Cliente</h2>
              <button
                onClick={() => {
                  setShowTabModal(false);
                  setNewTabName('');
                  setNewTabPhone('');
                }}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Nome do Cliente</label>
                <input
                  type="text"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  placeholder="Ex: Sr. João"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-medium placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Telefone (Opcional)</label>
                <input
                  type="text"
                  value={newTabPhone}
                  onChange={(e) => setNewTabPhone(e.target.value)}
                  placeholder="Ex: +258 84 123 4567"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-medium placeholder:text-gray-600"
                />
              </div>
            </div>
            <div className="px-6 py-5 bg-gray-900/50 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowTabModal(false);
                  setNewTabName('');
                  setNewTabPhone('');
                }}
                className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTab}
                disabled={!newTabName.trim()}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl disabled:opacity-50 transition-all"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog - FastFood Dark Style */}
      <AnimatePresence>
        {showShareDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className="w-full max-w-md rounded-3xl bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border border-gray-800 shadow-[0_40px_80px_rgba(0,0,0,0.75)] overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between border-b border-gray-800">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                    Partilhar Restaurante
                  </p>
                  <h2 className="text-lg font-black text-white mt-1 line-clamp-1">
                    {restaurant.name}
                  </h2>
                </div>
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 pt-5 pb-2 space-y-4">
                {/* URL + Slug + Copy */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-1">
                      Link direto
                    </p>
                    <p className="text-xs font-mono text-gray-300 break-all">
                      {typeof window !== 'undefined'
                        ? `${window.location.origin}/${restaurant.slug}`
                        : `/${restaurant.slug}`}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (typeof window === 'undefined') return;
                      const url = `${window.location.origin}/${restaurant.slug}`;
                      try {
                        setCopying(true);
                        await navigator.clipboard.writeText(url);
                        toast.success('Link copiado!');
                      } catch {
                        toast.error('Não foi possível copiar o link.');
                      } finally {
                        setCopying(false);
                      }
                    }}
                    className="ml-2 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-[11px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    {copying ? 'Copiando...' : 'Copiar'}
                  </button>
                </div>

                {/* QR Code */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                    QR Code do Restaurante
                  </p>
                  <div className="bg-white rounded-3xl p-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
                    {typeof window !== 'undefined' && (
                      // Usando serviço externo simples para gerar QR code a partir da URL
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          `${window.location.origin}/${restaurant.slug}`
                        )}`}
                        alt="QR Code do restaurante"
                        className="w-44 h-44 object-contain"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 text-center max-w-xs">
                    Aponte a câmara para abrir o restaurante diretamente no FastFood.
                  </p>
                </div>

                {/* Social icons */}
                <div className="pt-1 pb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 text-center">
                    Partilhar em
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    {/* Apenas ícones estilizados; a lógica de share completa pode ser adicionada depois */}
                    <button className="w-10 h-10 rounded-2xl bg-[#1877F2] flex items-center justify-center text-white shadow-lg shadow-[#1877F2]/40 active:scale-95 transition-transform">
                      <span className="text-sm font-black">f</span>
                    </button>
                    <button className="w-10 h-10 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/40 active:scale-95 transition-transform">
                      <span className="text-base font-black">🟢</span>
                    </button>
                    <button className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-lg shadow-[#DD2A7B]/40 active:scale-95 transition-transform">
                      <span className="text-sm font-black">IG</span>
                    </button>
                    <button className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg shadow-black/40 active:scale-95 transition-transform">
                      <span className="text-sm font-black">X</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Sub-component: Premium Product Card (List Style)
const ProductCard = ({ item, type, quantity, onAdd, onRemove, isDrink }: any) => {
  const isEmojiImage = item.image && isEmoji(item.image);
  const isEmojiPhoto = item.photo && isEmoji(item.photo);
  const displayEmoji = isEmojiImage ? item.image : (isEmojiPhoto ? item.photo : (item.emoji || (isDrink ? '🥤' : '🍔')));
  const imageUrl = (!isEmojiImage && item.image) ? getImageUrl(item.image) : ((!isEmojiPhoto && item.photo) ? getImageUrl(item.photo) : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      className="group relative bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-row overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-3xl">
            {displayEmoji}
          </div>
        )}

        {/* Quantity Badge Over Image */}
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-2 right-2 bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-orange-500/30 ring-2 ring-white z-10"
          >
            {quantity}
          </motion.div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-grow p-3 sm:p-4 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <h3 className="text-xs sm:text-base font-black text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <span className="text-xs sm:text-base font-black text-orange-600 whitespace-nowrap">
            {item.price}<span className="text-[8px] ml-0.5">MT</span>
          </span>
        </div>

        <div className="flex-grow">
          {item.description && (
            <p className="text-[9px] sm:text-xs text-gray-400 font-medium leading-relaxed line-clamp-1 sm:line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          {quantity > 0 ? (
            <div className="inline-flex items-center gap-2 bg-gray-50 rounded-xl p-0.5 border border-gray-100">
              <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-400 hover:text-red-500 active:scale-90 transition-all">
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="text-[10px] font-black text-gray-900 w-4 text-center">{quantity}</span>
              <button onClick={onAdd} className="w-7 h-7 flex items-center justify-center bg-gray-900 text-white rounded-lg shadow-lg active:scale-95 transition-all">
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="px-3 py-1.5 bg-gray-900 hover:bg-orange-500 text-white font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-gray-200 hover:shadow-orange-200"
            >
              <span className="uppercase text-[8px] tracking-widest">Add</span>
              <Plus size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Sub-component: Restaurant Page Skeleton
const RestaurantSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[300px] bg-gray-200">
        <div className="absolute bottom-10 left-0 w-full px-6">
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <div className="h-10 bg-gray-300 rounded-2xl w-2/3 md:w-1/3"></div>
            <div className="flex items-center gap-3">
              <div className="h-4 bg-gray-300 rounded-lg w-16"></div>
              <div className="h-4 bg-gray-300 rounded-lg w-24"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="relative z-10 -mt-6 bg-gray-50 rounded-t-[2.5rem] pt-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Search Bar Skeleton */}
          <div className="h-16 bg-white rounded-[1.5rem] shadow-sm w-full"></div>

          {/* Categories Skeleton */}
          <div className="flex gap-2 overflow-x-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-white rounded-xl w-24 flex-shrink-0 shadow-sm"></div>
            ))}
          </div>

          {/* Product Grid Skeleton */}
          <div className="space-y-12">
            {[...Array(2)].map((_, g) => (
              <div key={g} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 rounded-xl w-48"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-20"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-4 flex gap-4 h-32">
                      <div className="w-24 md:w-32 bg-gray-100 rounded-xl flex-shrink-0"></div>
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                        <div className="h-8 bg-gray-50 rounded-xl w-24 mt-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

