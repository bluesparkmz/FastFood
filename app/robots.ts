import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://fastfood.skyvenda.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/profile/',
                    '/orders/',
                    '/notifications/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
