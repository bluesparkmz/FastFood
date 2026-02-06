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

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  const restaurant = await fetchRestaurantBySlug(slug);

  if (!restaurant) {
    return {
      title: 'Restaurante - FastFood SkyVenda',
      description: 'Peça online no FastFood SkyVenda.',
      openGraph: {
        title: 'Restaurante - FastFood SkyVenda',
        description: 'Peça online no FastFood SkyVenda.',
        url: `https://fastfood.skyvenda.com/share/${slug}`,
        images: ['https://fastfood.skyvenda.com/images/fastfood-share-default.png'],
      }
    };
  }

  const siteUrl = 'https://fastfood.skyvenda.com';
  const targetUrl = `${siteUrl}/${restaurant.slug || slug}`;
  const imageUrl = restaurant.cover_image
    ? (restaurant.cover_image.startsWith('http') ? restaurant.cover_image : `${base_url}/${restaurant.cover_image.replace(/^\//, '')}`)
    : `${siteUrl}/images/fastfood-share-default.png`;

  const title = `${restaurant.name} | FastFood SkyVenda`;
  const description = restaurant.neighborhood
    ? `Cardápio de ${restaurant.name} em ${restaurant.neighborhood}. Peça agora pelo FastFood SkyVenda.`
    : `Veja o cardápio de ${restaurant.name} no FastFood SkyVenda e faça seu pedido online.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: targetUrl,
      type: 'website',
      siteName: 'FastFood SkyVenda',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: restaurant.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: targetUrl,
    },
  };
}

export default async function ShareRestaurantPage(props: PageProps) {
  const params = await props.params;
  const slug = params.slug;

  // Buscar o restaurante para garantir que temos o slug correto para o redirect (caso usem ID no share)
  const restaurant = await fetchRestaurantBySlug(slug);
  const targetUrl = `/${restaurant?.slug || slug}`;

  return (
    <>
      {/* Script de Redirecionamento Imediato no Cliente */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== "undefined") {
              // O replace não deixa a página de share no histórico do browser
              window.location.replace(${JSON.stringify(targetUrl)});
            }
          `,
        }}
      />

      {/* Fallback de Redirecionamento 0s (SEO robots geralmente ignoram meta refresh de 0s) */}
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
      </noscript>

      {/* Página vazia como solicitado */}
      <div style={{ display: 'none' }}>
        Redirecionando para {restaurant?.name || 'restaurante'}...
      </div>
    </>
  );
}

