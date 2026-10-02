export const BASE_TYPES = ['Guerra', 'Liga', 'Competitivo', 'Mejora'];

const BASE_TYPE_ICONS = {
    Guerra: 'sword',
    Liga: 'trophy-outline',
    Mejora: 'hammer',
    Competitivo: 'shield-outline',
};

export function getBaseTypeIcon(type) {
    return BASE_TYPE_ICONS[type] ?? BASE_TYPE_ICONS.Competitivo;
}

export const TOWN_HALL_LEVELS = Array.from({ length: 16 }, (_, i) => i + 3);

export const WEB_URL = 'https://cocbase.vercel.app';

export const ADMIN_ROLE = 'admin';
