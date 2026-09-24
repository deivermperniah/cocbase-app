export function formatRelativeDate(value) {
    const days = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'hoy';
    if (days === 1) return 'ayer';
    return `hace ${days} días`;
}
