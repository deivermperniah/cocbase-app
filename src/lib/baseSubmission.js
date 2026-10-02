import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Crypto from 'expo-crypto';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

const BUCKET = 'bases-fotos';
const MAX_IMAGE_DIMENSION = 1920;
const LINK_PATTERN = /^https:\/\/link\.clashofclans\.com\/\S*[?&]id=([^&\s]+)/i;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const SUBMISSION_COLUMNS = 'id, level_th, type, status, review_note, created_at';

export class SubmissionError extends Error {}

export function getBaseLinkId(link) {
    const match = link.trim().match(LINK_PATTERN);
    if (!match) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return null;
    }
}

function escapeLike(value) {
    return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

async function isLinkTaken(link, linkId) {
    const { data: exactMatches, error: exactError } = await supabase
        .from('bases')
        .select('id')
        .eq('link', link)
        .limit(1);

    if (exactError) throw new SubmissionError('No se pudo comprobar el enlace. Inténtalo de nuevo.');
    if (exactMatches.length > 0) return true;

    const idToken = linkId.split(':').pop();
    const { data: similarMatches, error: similarError } = await supabase
        .from('bases')
        .select('link')
        .ilike('link', `%${escapeLike(idToken)}%`)
        .limit(50);

    if (similarError) throw new SubmissionError('No se pudo comprobar el enlace. Inténtalo de nuevo.');
    return similarMatches.some(base => base.link && getBaseLinkId(base.link) === linkId);
}

async function optimizeImage(asset) {
    const context = ImageManipulator.manipulate(asset.uri);
    let image;

    try {
        if (Math.max(asset.width, asset.height) > MAX_IMAGE_DIMENSION) {
            context.resize(asset.width >= asset.height
                ? { width: MAX_IMAGE_DIMENSION }
                : { height: MAX_IMAGE_DIMENSION });
        }
        image = await context.renderAsync();
        const result = await image.saveAsync({ format: SaveFormat.WEBP, compress: 0.85, base64: true });
        return decode(result.base64);
    } finally {
        image?.release();
        context.release();
    }
}

async function uploadImage(bytes) {
    const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, new Uint8Array(bytes));
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const fileName = `${hash.slice(0, 16)}.webp`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, bytes, { contentType: 'image/webp', cacheControl: '3600', upsert: false });

    if (error) {
        const isDuplicate = error.statusCode === '409' || /exists|duplicate/i.test(error.message);
        throw new SubmissionError(isDuplicate
            ? 'Esta captura ya se subió antes. Usa otra.'
            : 'No se pudo subir la captura. Inténtalo de nuevo.');
    }

    return {
        fileName,
        publicUrl: supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl,
    };
}

export async function submitBase({ level, type, link, asset, userId, publish = false }) {
    const trimmedLink = link.trim();

    if (trimmedLink) {
        const linkId = getBaseLinkId(trimmedLink);
        if (!linkId) throw new SubmissionError('El enlace no es válido. Cópialo desde Clash of Clans.');
        if (await isLinkTaken(trimmedLink, linkId)) {
            throw new SubmissionError('Esta base ya está en cocbase.');
        }
    }

    const bytes = await optimizeImage(asset);
    const { fileName, publicUrl } = await uploadImage(bytes);

    const { data, error } = await supabase
        .from('bases')
        .insert({
            link: trimmedLink || null,
            type,
            level_th: level,
            url_foto: publicUrl,
            status: publish ? 'approved' : 'pending',
            author_id: userId,
        })
        .select(SUBMISSION_COLUMNS)
        .single();

    if (error) {
        await supabase.storage.from(BUCKET).remove([fileName]);
        throw new SubmissionError('No se pudo guardar la base. Inténtalo de nuevo.');
    }

    return data;
}

export async function deleteRejectedSubmission(submissionId) {
    const { data, error } = await supabase
        .from('bases')
        .delete()
        .eq('id', submissionId)
        .eq('status', 'rejected')
        .select('id');

    if (error || data.length === 0) {
        throw new SubmissionError('Revisa tu conexión e inténtalo de nuevo.');
    }
}
