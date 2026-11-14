import { supabase } from '../lib/supabase';

const BUCKET = 'avatars';

export async function resolveAvatarUrl(value) {
    if (!value) return null;

    // Works for both a plain path ("userId/avatar.jpg")
    // and a full Supabase URL (public or signed)
    const marker = `/${BUCKET}/`;
    const idx = value.indexOf(marker);

    const path = decodeURIComponent(
        (idx >= 0 ? value.slice(idx + marker.length) : value).split('?')[0]
    );

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 3600);

    if (error) throw error;

    return data.signedUrl;
}