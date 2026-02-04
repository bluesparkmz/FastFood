import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Clock, ChevronRight, Store, ArrowRight } from 'lucide-react';
import type { Restaurant } from '@/types/fastfood';
import { getImageUrl } from '@/utils/imageUtils';

// Províncias de Moçambique
const PROVINCES = [
    { name: 'Maputo Cidade', slug: 'maputo-cidade' },
    { name: 'Maputo', slug: 'maputo' },
    { name: 'Gaza', slug: 'gaza' },
    { name: 'Inhambane', slug: 'inhambane' },
    { name: 'Sofala', slug: 'sofala' },
    { name: 'Manica', slug: 'manica' },
    { name: 'Tete', slug: 'tete' },
    { name: 'Zambézia', slug: 'zambezia' },
    { name: 'Nampula', slug: 'nampula' },
    { name: 'Niassa', slug: 'niassa' },
    { name: 'Cabo Delgado', slug: 'cabo-delgado' },
];

// SEO Metadata
export const metadata: Metadata = {
    title: 'Restaurantes em Moçambique | FastFood SkyVenda',
    description: 'Encontre os melhores restaurantes de comida rápida em Moçambique. Explore restaurantes por província, veja avaliações, horários e faça pedidos online.',
    keywords: ['restaurantes', 'moçambique', 'fastfood', 'delivery', 'comida rápida', 'pedidos online'],
    openGraph: {
        title: 'Restaurantes em Moçambique | FastFood SkyVenda',
        description: 'Encontre os melhores restaurantes de comida rápida em Moçambique.',
        type: 'website',
        locale: 'pt_MZ',
        siteName: 'FastFood SkyVenda',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Restaurantes em Moçambique | FastFood SkyVenda',
        description: 'Encontre os melhores restaurantes de comida rápida em Moçambique.',
    },
};

// Fetch restaurants from API (server-side)
async function getRestaurants(): Promise<Restaurant[]> {
    try {
        const res = await fetch('https://api.skyvenda.com/fastfood/restaurants/explore', {
            next: { revalidate: 60 }, // Revalidate every 60 seconds
        });

        if (!res.ok) {
            console.error('Failed to fetch restaurants:', res.status);
            return [];
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
    }
}

// Server-compatible Restaurant Card
function RestaurantCardServer({ restaurant }: { restaurant: Restaurant }) {
    const defaultImage = '/images/restaurant-placeholder.svg';
    const imageUrl = getImageUrl(restaurant.cover_image) || defaultImage;

    return (
        <Link href={`/${restaurant.slug}`} className="block group">
            <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-100 transition-all duration-300 h-full">
                {/* Cover Image */}
                <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
                    <Image
                        src={imageUrl}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                        {restaurant.is_open ? (
                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                Aberto
                            </span>
                        ) : (
                            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Fechado
                            </span>
                        )}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur px-2 py-1 rounded-lg shadow">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-900">{(restaurant.rating || 0).toFixed(1)}</span>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    {restaurant.category && (
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                            {restaurant.category}
                        </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mt-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {restaurant.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                        {(restaurant.district || restaurant.province) && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                <span className="line-clamp-1">
                                    {[restaurant.district, restaurant.province].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                        {restaurant.opening_time && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{restaurant.opening_time.slice(0, 5)} - {restaurant.closing_time?.slice(0, 5)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                        <div className="text-xs">
                            {restaurant.min_delivery_value > 0 ? (
                                <span className="text-gray-500">
                                    Pedido mín: <span className="font-bold text-orange-600">{restaurant.min_delivery_value} MT</span>
                                </span>
                            ) : (
                                <span className="font-bold text-emerald-600">Entrega Grátis</span>
                            )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default async function RestaurantesPage() {
    const restaurants = await getRestaurants();

    return (
        <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-2 text-orange-200 text-sm mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Início</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span>Restaurantes</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Restaurantes em Moçambique
                    </h1>
                    <p className="text-lg text-orange-100 max-w-2xl">
                        Explore os melhores restaurantes de comida rápida. Escolha por província ou navegue por todos os estabelecimentos disponíveis.
                    </p>
                </div>
            </section>

            {/* Province Navigation */}
            {/* Province Navigation */}
            <section className="py-4 px-4 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-20 shadow-sm transition-all">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="flex-shrink-0 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 border-r border-gray-200 pr-3">
                            <MapPin className="w-3.5 h-3.5" />
                            Províncias
                        </div>
                        {PROVINCES.map((province) => (
                            <Link
                                key={province.slug}
                                href={`/restaurantes/${province.slug}`}
                                className="flex-shrink-0 px-4 py-1.5 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-full text-sm font-medium transition-all hover:shadow-sm border border-gray-100 hover:border-orange-200 whitespace-nowrap"
                            >
                                {province.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Restaurant Grid */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Store className="w-6 h-6 text-orange-500" />
                            Todos os Restaurantes
                            <span className="text-sm font-normal text-gray-400 ml-2">({restaurants.length})</span>
                        </h2>
                    </div>

                    {restaurants.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {restaurants.map((restaurant) => (
                                <RestaurantCardServer key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum restaurante encontrado</h3>
                            <p className="text-gray-400">Volte mais tarde para ver novos restaurantes.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-black mb-4">Tem um Restaurante?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Junte-se à maior plataforma de delivery de Moçambique e alcance milhares de clientes.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold transition-all hover:shadow-lg hover:shadow-orange-500/30"
                    >
                        Cadastrar Restaurante
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
