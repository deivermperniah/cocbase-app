import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BASE_COLUMNS, supabase } from '../lib/supabase';
import { showMessage } from '../lib/dialogs';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
    const { user } = useAuth();
    const userId = user?.id;
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const favoritesRef = useRef(favorites);
    favoritesRef.current = favorites;

    const fetchFavorites = useCallback(async () => {
        if (!userId) return;
        setError(false);

        const { data, error: fetchError } = await supabase
            .from('favorites')
            .select(`created_at, bases(${BASE_COLUMNS})`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (fetchError) {
            setError(true);
        } else {
            setFavorites(data.map(row => row.bases).filter(Boolean));
        }
    }, [userId]);

    useEffect(() => {
        setFavorites([]);
        if (!userId) return;

        setLoading(true);
        fetchFavorites().finally(() => setLoading(false));
    }, [userId, fetchFavorites]);

    const favoriteIds = useMemo(() => new Set(favorites.map(base => base.id)), [favorites]);

    const toggleFavorite = useCallback(async (base) => {
        if (!userId) return;

        const previous = favoritesRef.current;
        const isFavorite = previous.some(item => item.id === base.id);

        setFavorites(isFavorite ? previous.filter(item => item.id !== base.id) : [base, ...previous]);

        const { error: toggleError } = isFavorite
            ? await supabase.from('favorites').delete().eq('user_id', userId).eq('base_id', base.id)
            : await supabase.from('favorites').insert({ user_id: userId, base_id: base.id });

        if (toggleError) {
            setFavorites(previous);
            showMessage('Favoritos', isFavorite
                ? 'No se pudo quitar de favoritos.'
                : 'No se pudo guardar en favoritos.');
        }
    }, [userId]);

    const value = useMemo(() => ({
        favorites,
        favoriteIds,
        loading,
        error,
        refresh: fetchFavorites,
        toggleFavorite,
    }), [favorites, favoriteIds, loading, error, fetchFavorites, toggleFavorite]);

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
    return useContext(FavoritesContext);
}
