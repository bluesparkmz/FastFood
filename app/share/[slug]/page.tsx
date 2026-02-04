import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Restaurant } from '@/types/fastfood';
import { base_url } from '@/api/api';

async function fetchRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  try {
    const res = await fetch(`${base_url}/fastfood/restaurants/s/${encodeURIComponent(slug)}`, {
      // Revalida periodicamente para manter SEO atualizado
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as Restaurant;
    return data;
  } catch {
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
      title: 'FastFood - Restaurante não encontrado',
      description: 'O restaurante que tentou aceder não foi encontrado.',
    };
  }

  const siteUrl = 'https://fastfood.skyvenda.com';
  const canonicalUrl = `${siteUrl}/${restaurant.slug || params.slug}`;

  const imageUrl = restaurant.cover_image
    ? `${base_url}/${restaurant.cover_image.replace(/^\//, '')}`
    : `${siteUrl}/images/fastfood-share-default.png`;

  const title = `${restaurant.name} - FastFood SkyVenda MZ`;
  const description =
    restaurant.neighborhood && restaurant.province
      ? `Peça no ${restaurant.name} em ${restaurant.neighborhood}, ${restaurant.province} pelo FastFood SkyVenda MZ.`
      : `Peça no ${restaurant.name} pelo FastFood SkyVenda MZ.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: restaurant.name,
        },
      ],
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

  if (!restaurant) {
    notFound();
  }

  // Determine redirect URL
  const targetUrl = `/${restaurant.slug || params.slug}`;

  // Client-side redirect to allow crawlers to read metadata first
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== "undefined") {
              window.location.replace(${JSON.stringify(targetUrl)});
            }
          `,
        }}
      />
    </>
  );
}

