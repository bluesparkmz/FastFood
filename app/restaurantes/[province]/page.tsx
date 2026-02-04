import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Star, Clock, ChevronRight, Store, ArrowLeft } from 'lucide-react';
import type { Restaurant } from '@/types/fastfood';
import { getImageUrl } from '@/utils/imageUtils';

// Províncias de Moçambique com slugs e nomes
const PROVINCES: Record<string, string> = {
    'maputo-cidade': 'Maputo Cidade',
    'maputo': 'Maputo',
    'gaza': 'Gaza',
    'inhambane': 'Inhambane',
    'sofala': 'Sofala',
    'manica': 'Manica',
    'tete': 'Tete',
    'zambezia': 'Zambézia',
    'nampula': 'Nampula',
    'niassa': 'Niassa',
    'cabo-delgado': 'Cabo Delgado',
};

// Generate static params for all provinces
export async function generateStaticParams() {
    return Object.keys(PROVINCES).map((slug) => ({
        province: slug,
    }));
}

// Dynamic metadata based on province
export async function generateMetadata({
    params
}: {
    params: Promise<{ province: string }>
}): Promise<Metadata> {
    const { province: slug } = await params;
    const provinceName = PROVINCES[slug];

    if (!provinceName) {
        return {
            title: 'Província não encontrada | FastFood SkyVenda',
        };
    }

    return {
        title: `Restaurantes em ${provinceName} | FastFood SkyVenda`,
        description: `Descubra os melhores restaurantes de comida rápida em ${provinceName}, Moçambique. Veja avaliações, horários de funcionamento e faça pedidos online.`,
        keywords: ['restaurantes', provinceName.toLowerCase(), 'moçambique', 'fastfood', 'delivery', 'comida rápida'],
        openGraph: {
            title: `Restaurantes em ${provinceName} | FastFood SkyVenda`,
            description: `Encontre restaurantes de comida rápida em ${provinceName}.`,
            type: 'website',
            locale: 'pt_MZ',
            siteName: 'FastFood SkyVenda',
        },
        twitter: {
            card: 'summary_large_image',
            title: `Restaurantes em ${provinceName} | FastFood SkyVenda`,
            description: `Encontre restaurantes de comida rápida em ${provinceName}.`,
        },
    };
}

// Fetch restaurants filtered by province
async function getRestaurantsByProvince(provinceName: string): Promise<Restaurant[]> {
    try {
        const res = await fetch(
            `https://api.skyvenda.com/fastfood/restaurants/search?province=${encodeURIComponent(provinceName)}`,
            { next: { revalidate: 60 } }
        );

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

// Province Pills for Navigation
function ProvincePills({ currentSlug }: { currentSlug: string }) {
    return (
        <div className="flex flex-wrap gap-2">
            {Object.entries(PROVINCES).map(([slug, name]) => (
                <Link
                    key={slug}
                    href={`/restaurantes/${slug}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${slug === currentSlug
                            ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                            : 'bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 border-gray-100 hover:border-orange-200'
                        }`}
                >
                    {name}
                </Link>
            ))}
        </div>
    );
}

export default async function ProvincePage({
    params
}: {
    params: Promise<{ province: string }>
}) {
    const { province: slug } = await params;
    const provinceName = PROVINCES[slug];

    if (!provinceName) {
        notFound();
    }

    const restaurants = await getRestaurantsByProvince(provinceName);

    return (
        <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-orange-200 text-sm mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Início</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/restaurantes" className="hover:text-white transition-colors">Restaurantes</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">{provinceName}</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Restaurantes em {provinceName}
                    </h1>
                    <p className="text-lg text-orange-100 max-w-2xl">
                        Explore os melhores restaurantes de comida rápida em {provinceName}.
                        Faça pedidos online e receba no conforto da sua casa.
                    </p>
                </div>
            </section>

            {/* Province Navigation */}
            <section className="py-8 px-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href="/restaurantes"
                            className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Todas Províncias
                        </Link>
                    </div>
                    <ProvincePills currentSlug={slug} />
                </div>
            </section>

            {/* Restaurant Grid */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Store className="w-6 h-6 text-orange-500" />
                            Restaurantes em {provinceName}
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
                            <h3 className="text-xl font-bold text-gray-600 mb-2">
                                Nenhum restaurante em {provinceName}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Ainda não há restaurantes cadastrados nesta província.
                            </p>
                            <Link
                                href="/restaurantes"
                                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Ver todas as províncias
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Other Provinces Section */}
            <section className="py-12 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Explorar Outras Províncias</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {Object.entries(PROVINCES)
                            .filter(([s]) => s !== slug)
                            .map(([s, name]) => (
                                <Link
                                    key={s}
                                    href={`/restaurantes/${s}`}
                                    className="bg-white rounded-xl p-4 text-center hover:shadow-lg hover:border-orange-200 border border-gray-100 transition-all group"
                                >
                                    <MapPin className="w-6 h-6 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                                        {name}
                                    </span>
                                </Link>
                            ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
