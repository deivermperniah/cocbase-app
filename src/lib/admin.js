import { supabase } from './supabase';
import { BASE_TYPES } from './constants';
import { confirmAction, showMessage } from './dialogs';

const BUCKET = 'bases-fotos';
const STORAGE_MARKER = `/storage/v1/object/public/${BUCKET}/`;
const IMAGE_PATTERN = /\.(jpe?g|png|webp)$/i;

const IMAGES_PAGE_SIZE = 24;
export const REVIEW_COLUMNS = 'id, level_th, type, url_foto, link, created_at, profiles!bases_author_id_fkey(full_name)';

function getStoragePath(publicUrl) {
    const index = publicUrl?.indexOf(STORAGE_MARKER) ?? -1;
    if (index === -1) return null;
    return decodeURIComponent(publicUrl.slice(index + STORAGE_MARKER.length));
}

function countBases(filters = {}) {
    let query = supabase.from('bases').select('id', { count: 'exact', head: true });
    Object.entries(filters).forEach(([column, value]) => {
        query = query.eq(column, value);
    });
    return query;
}

export async function fetchDashboardStats() {
    const [approved, pending, ...byType] = await Promise.all([
        countBases({ status: 'approved' }),
        countBases({ status: 'pending' }),
        ...BASE_TYPES.map(type => countBases({ status: 'approved', type })),
    ]);

    const failed = [approved, pending, ...byType].find(result => result.error);
    if (failed) throw failed.error;

    return {
        approved: approved.count,
        pending: pending.count,
        byType: Object.fromEntries(BASE_TYPES.map((type, index) => [type, byType[index].count])),
    };
}

export async function reviewBase(baseId, status, note = null) {
    const { data, error } = await supabase
        .from('bases')
        .update({ status, reviewed_at: new Date().toISOString(), review_note: note })
        .eq('id', baseId)
        .select('id');

    if (error || data.length === 0) throw error ?? new Error('Base no actualizada');
}

async function deleteBase(base) {
    const { data, error } = await supabase
        .from('bases')
        .delete()
        .eq('id', base.id)
        .select('id');

    if (error || data.length === 0) throw error ?? new Error('Base no eliminada');

    const imagePath = getStoragePath(base.url_foto);
    if (imagePath) {
        await supabase.storage.from(BUCKET).remove([imagePath]);
    }
}

export async function confirmAndDeleteBase(base) {
    const confirmed = await confirmAction(
        '¿Eliminar esta base?',
        'Se borrará junto con su imagen y dejará de verse en la app. No se puede deshacer.',
        'Eliminar',
        { icon: 'trash-outline' },
    );
    if (!confirmed) return false;

    try {
        await deleteBase(base);
        return true;
    } catch {
        showMessage('No se pudo eliminar', 'Revisa tu conexión e inténtalo de nuevo.');
        return false;
    }
}

export async function fetchUsedImageUrls() {
    const { data, error } = await supabase.from('bases').select('url_foto').not('url_foto', 'is', null);
    if (error) throw error;
    return new Set(data.map(row => row.url_foto));
}

export async function fetchImagesPage(offset) {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .list('', {
            limit: IMAGES_PAGE_SIZE,
            offset,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (error) throw error;

    return {
        hasMore: data.length === IMAGES_PAGE_SIZE,
        images: data
            .filter(file => IMAGE_PATTERN.test(file.name))
            .map(file => ({
                name: file.name,
                size: file.metadata?.size ?? 0,
                url: supabase.storage.from(BUCKET).getPublicUrl(file.name).data.publicUrl,
            })),
    };
}

export async function confirmAndDeleteImage(image, inUse) {
    const confirmed = await confirmAction(
        inUse ? '¿Eliminar imagen en uso?' : '¿Eliminar imagen?',
        inUse
            ? 'Una base usa esta imagen y se quedará sin foto. No se puede deshacer.'
            : 'Ninguna base la usa. No se puede deshacer.',
        'Eliminar',
        { icon: 'trash-outline' },
    );
    if (!confirmed) return false;

    if (inUse) {
        const { error } = await supabase.from('bases').update({ url_foto: null }).eq('url_foto', image.url);
        if (error) {
            showMessage('No se pudo eliminar', 'La imagen sigue vinculada a su base. Inténtalo de nuevo.');
            return false;
        }
    }

    const { error } = await supabase.storage.from(BUCKET).remove([image.name]);
    if (error) {
        showMessage('No se pudo eliminar', 'La imagen sigue guardada. Inténtalo de nuevo.');
        return false;
    }
    return true;
}
