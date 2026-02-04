import { MetadataRoute } from 'next';

// Províncias de Moçambique com suas principais cidades/distritos
const PROVINCES_WITH_DISTRICTS: Record<string, string[]> = {
    'maputo-cidade': [
        'kampfumo', 'nlhamankulu', 'kamaxakeni', 'kamubukwana',
        'kamavota', 'katembe', 'kanyaka', 'polana', 'sommerschield',
        'baixa', 'alto-mae', 'malhangalene', 'maxaquene', 'hulene'
    ],
    'maputo': [
        'matola', 'boane', 'marracuene', 'magude', 'moamba',
        'manhica', 'namaacha', 'matutuine'
    ],
    'gaza': ['xai-xai', 'chokwe', 'chibuto'],
    'inhambane': ['inhambane', 'maxixe', 'vilankulo'],
    'sofala': ['beira', 'dondo', 'gorongosa'],
    'manica': ['chimoio', 'gondola', 'manica'],
    'tete': ['tete', 'moatize', 'songo'],
    'zambezia': ['quelimane', 'mocuba', 'gurue'],
    'nampula': ['nampula', 'nacala', 'angoche'],
    'niassa': ['lichinga', 'cuamba', 'mandimba'],
    'cabo-delgado': ['pemba', 'montepuez', 'mocimboa-da-praia'],
};

const BASE_URL = 'https://fastfood.skyvenda.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/restaurantes`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/search`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/nearby`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/suggested`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/help`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.4,
        },
    ];

    // Province routes
    const provinceRoutes: MetadataRoute.Sitemap = Object.keys(PROVINCES_WITH_DISTRICTS).map((province) => ({
        url: `${BASE_URL}/restaurants/${province}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    // District routes (3 main cities per province)
    const districtRoutes: MetadataRoute.Sitemap = Object.entries(PROVINCES_WITH_DISTRICTS).flatMap(
        ([province, districts]) =>
            districts.map((district) => ({
                url: `${BASE_URL}/restaurants/${province}/${district}`,
                lastModified: now,
                changeFrequency: 'daily' as const,
                priority: 0.7,
            }))
    );

    return [...staticRoutes, ...provinceRoutes, ...districtRoutes];
}
