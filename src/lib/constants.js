export const BASE_TYPES = ['Guerra', 'Liga', 'Mejora', 'Recursos'];

const BASE_TYPE_ICONS = {
    Guerra: 'sword',
    Liga: 'trophy-outline',
    Mejora: 'hammer',
    Recursos: 'shield-outline',
};

export function getBaseTypeIcon(type) {
    return BASE_TYPE_ICONS[type] ?? BASE_TYPE_ICONS.Recursos;
}

export const TOWN_HALL_LEVELS = Array.from({ length: 16 }, (_, i) => i + 3);

export const WEB_URL = 'https://cocbase.vercel.app';

export const ADMIN_ROLE = 'admin';
