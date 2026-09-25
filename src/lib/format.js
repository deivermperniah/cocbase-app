export function formatRelativeDate(value) {
    const days = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'hoy';
    if (days === 1) return 'ayer';
    return `hace ${days} días`;
}

const NEW_BASE_DAYS = 7;

export function isNewBase(createdAt) {
    if (!createdAt) return false;
    const diffInDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= NEW_BASE_DAYS;
}
