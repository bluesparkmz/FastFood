import type { Metadata } from 'next';
import type { Restaurant } from '@/types/fastfood';
import { base_url } from '@/api/api';

async function fetchRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  try {
    // Usar encodeURIComponent para garantir que o slug seja tratado corretamente na URL
    const res = await fetch(`${base_url}/fastfood/restaurants/s/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 }, // Cache de 5 minutos para SEO
    });

    if (!res.ok) {
      return null;
    }
    return await res.json() as Restaurant;
  } catch (error) {
    console.error('Error fetching restaurant for share page:', error);
    return null;
  }
}

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const restaurant = await fetchRestaurantBySlug(params.slug);

  if (!restaurant) {
    return {
      title: 'Restaurante - FastFood SkyVenda',
      description: 'Peça online no FastFood SkyVenda.',
    };
  }

  const siteUrl = 'https://fastfood.skyvenda.com';
  const targetUrl = `${siteUrl}/${restaurant.slug || params.slug}`;
  const imageUrl = restaurant.cover_image
    ? (restaurant.cover_image.startsWith('http') ? restaurant.cover_image : `${base_url}/${restaurant.cover_image.replace(/^\//, '')}`)
    : `${siteUrl}/images/fastfood-share-default.png`;

  const title = `${restaurant.name} | FastFood SkyVenda`;
  const description = restaurant.neighborhood
    ? `Peça agora em ${restaurant.name} (${restaurant.neighborhood}). Cardápio completo e entrega rápida via FastFood.`
    : `Peça agora em ${restaurant.name} pelo FastFood. Cardápio completo e entrega rápida.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: targetUrl,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: restaurant.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ShareRestaurantPage({ params }: PageProps) {
  const restaurant = await fetchRestaurantBySlug(params.slug);
  const targetUrl = `/${restaurant?.slug || params.slug}`;
  const fullTargetUrl = `https://fastfood.skyvenda.com${targetUrl}`;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        {/* Loading Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🍕</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-3">
          {restaurant ? `Indo para ${restaurant.name}...` : 'Redirecionando...'}
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Prepare o seu apetite! Estamos te levando para a página do restaurante para você fazer o seu pedido.
        </p>

        <a
          href={targetUrl}
          className="inline-flex items-center justify-center px-8 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all active:scale-95"
        >
          Entrar no Restaurante
        </a>

        <div className="mt-12 text-xs text-gray-400 font-medium tracking-widest uppercase">
          FastFood SkyVenda MZ
        </div>
      </div>

      {/* Script de Redirecionamento */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function() {
              window.location.replace(${JSON.stringify(targetUrl)});
            }, 500);
          `,
        }}
      />

      {/* Meta Refresh Fallback */}
      <noscript>
        <meta httpEquiv="refresh" content={`2;url=${targetUrl}`} />
      </noscript>
    </div>
  );
}

