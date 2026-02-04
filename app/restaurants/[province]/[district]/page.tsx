import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Star, Clock, ChevronRight, Store, ArrowLeft } from 'lucide-react';
import type { Restaurant } from '@/types/fastfood';
import { getImageUrl } from '@/utils/imageUtils';

// Províncias e distritos de Moçambique
const PROVINCES_DATA: Record<string, { name: string; districts: Record<string, string> }> = {
    'maputo-cidade': {
        name: 'Maputo Cidade',
        districts: {
            'kampfumo': 'KaMpfumo',
            'nlhamankulu': 'Nlhamankulu',
            'kamaxakeni': 'KaMaxakeni',
            'kamubukwana': 'KaMubukwana',
            'kamavota': 'KaMavota',
            'katembe': 'KaTembe',
            'kanyaka': 'KaNyaka',
            'polana': 'Polana',
            'sommerschield': 'Sommerschield',
            'baixa': 'Baixa',
            'alto-mae': 'Alto Maé',
            'malhangalene': 'Malhangalene',
            'maxaquene': 'Maxaquene',
            'hulene': 'Hulene',
        },
    },
    'maputo': {
        name: 'Maputo',
        districts: {
            'matola': 'Matola',
            'boane': 'Boane',
            'marracuene': 'Marracuene',
            'magude': 'Magude',
            'moamba': 'Moamba',
            'manhica': 'Manhiça',
            'namaacha': 'Namaacha',
            'matutuine': 'Matutuíne',
        },
    },
    'gaza': {
        name: 'Gaza',
        districts: {
            'xai-xai': 'Xai-Xai',
            'chokwe': 'Chókwè',
            'chibuto': 'Chibuto',
        },
    },
    'inhambane': {
        name: 'Inhambane',
        districts: {
            'inhambane': 'Inhambane',
            'maxixe': 'Maxixe',
            'vilankulo': 'Vilankulo',
        },
    },
    'sofala': {
        name: 'Sofala',
        districts: {
            'beira': 'Beira',
            'dondo': 'Dondo',
            'gorongosa': 'Gorongosa',
        },
    },
    'manica': {
        name: 'Manica',
        districts: {
            'chimoio': 'Chimoio',
            'gondola': 'Gondola',
            'manica': 'Manica',
        },
    },
    'tete': {
        name: 'Tete',
        districts: {
            'tete': 'Tete',
            'moatize': 'Moatize',
            'songo': 'Songo',
        },
    },
    'zambezia': {
        name: 'Zambézia',
        districts: {
            'quelimane': 'Quelimane',
            'mocuba': 'Mocuba',
            'gurue': 'Gurué',
        },
    },
    'nampula': {
        name: 'Nampula',
        districts: {
            'nampula': 'Nampula',
            'nacala': 'Nacala',
            'angoche': 'Angoche',
        },
    },
    'niassa': {
        name: 'Niassa',
        districts: {
            'lichinga': 'Lichinga',
            'cuamba': 'Cuamba',
            'mandimba': 'Mandimba',
        },
    },
    'cabo-delgado': {
        name: 'Cabo Delgado',
        districts: {
            'pemba': 'Pemba',
            'montepuez': 'Montepuez',
            'mocimboa-da-praia': 'Mocímboa da Praia',
        },
    },
};

// Generate static params for all province/district combinations
export async function generateStaticParams() {
    const params: { province: string; district: string }[] = [];

    for (const [provinceSlug, provinceData] of Object.entries(PROVINCES_DATA)) {
        for (const districtSlug of Object.keys(provinceData.districts)) {
            params.push({ province: provinceSlug, district: districtSlug });
        }
    }

    return params;
}

// Dynamic metadata
export async function generateMetadata({
    params,
}: {
    params: Promise<{ province: string; district: string }>;
}): Promise<Metadata> {
    const { province: provinceSlug, district: districtSlug } = await params;
    const provinceData = PROVINCES_DATA[provinceSlug];
    const districtName = provinceData?.districts[districtSlug];

    if (!provinceData || !districtName) {
        return { title: 'Distrito não encontrado | FastFood SkyVenda' };
    }

    return {
        title: `Restaurantes em ${districtName}, ${provinceData.name} | FastFood SkyVenda`,
        description: `Descubra os melhores restaurantes de comida rápida em ${districtName}, ${provinceData.name}. Veja avaliações, horários e faça pedidos online.`,
        keywords: ['restaurantes', districtName.toLowerCase(), provinceData.name.toLowerCase(), 'moçambique', 'fastfood', 'delivery'],
        openGraph: {
            title: `Restaurantes em ${districtName} | FastFood SkyVenda`,
            description: `Encontre restaurantes em ${districtName}, ${provinceData.name}.`,
            type: 'website',
            locale: 'pt_MZ',
            siteName: 'FastFood SkyVenda',
        },
    };
}

// Fetch restaurants filtered by district
async function getRestaurantsByDistrict(districtName: string): Promise<Restaurant[]> {
    try {
        const res = await fetch(
            `https://api.skyvenda.com/fastfood/restaurants/search?district=${encodeURIComponent(districtName)}`,
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
                <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
                    <Image
                        src={imageUrl}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
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
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur px-2 py-1 rounded-lg shadow">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-900">{(restaurant.rating || 0).toFixed(1)}</span>
                    </div>
                </div>
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

export default async function DistrictPage({
    params,
}: {
    params: Promise<{ province: string; district: string }>;
}) {
    const { province: provinceSlug, district: districtSlug } = await params;
    const provinceData = PROVINCES_DATA[provinceSlug];
    const districtName = provinceData?.districts[districtSlug];

    if (!provinceData || !districtName) {
        notFound();
    }

    const restaurants = await getRestaurantsByDistrict(districtName);

    return (
        <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-orange-200 text-sm mb-4 flex-wrap">
                        <Link href="/" className="hover:text-white transition-colors">Início</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/restaurantes" className="hover:text-white transition-colors">Restaurantes</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href={`/restaurants/${provinceSlug}`} className="hover:text-white transition-colors">
                            {provinceData.name}
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">{districtName}</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Restaurantes em {districtName}
                    </h1>
                    <p className="text-lg text-orange-100 max-w-2xl">
                        Explore os melhores restaurantes de comida rápida em {districtName}, {provinceData.name}.
                        Faça pedidos online e receba no conforto da sua casa.
                    </p>
                </div>
            </section>

            {/* Back Navigation */}
            <section className="py-6 px-4 border-b border-gray-100 bg-white">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <Link
                        href={`/restaurants/${provinceSlug}`}
                        className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para {provinceData.name}
                    </Link>
                </div>
            </section>

            {/* Restaurant Grid */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Store className="w-6 h-6 text-orange-500" />
                            Restaurantes em {districtName}
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
                                Nenhum restaurante em {districtName}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Ainda não há restaurantes cadastrados neste distrito.
                            </p>
                            <Link
                                href={`/restaurants/${provinceSlug}`}
                                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Ver todos em {provinceData.name}
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Other Districts in Province */}
            <section className="py-12 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Outros Distritos em {provinceData.name}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(provinceData.districts)
                            .filter(([slug]) => slug !== districtSlug)
                            .map(([slug, name]) => (
                                <Link
                                    key={slug}
                                    href={`/restaurants/${provinceSlug}/${slug}`}
                                    className="bg-white rounded-xl px-5 py-3 hover:shadow-lg hover:border-orange-200 border border-gray-100 transition-all group flex items-center gap-2"
                                >
                                    <MapPin className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
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
