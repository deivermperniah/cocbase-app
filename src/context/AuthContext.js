import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ADMIN_ROLE, WEB_URL } from '../lib/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
        });

        return () => subscription.unsubscribe();
    }, []);

    const userId = session?.user?.id;

    useEffect(() => {
        setProfile(null);
        if (!userId) return;

        let active = true;
        supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', userId)
            .maybeSingle()
            .then(({ data }) => {
                if (active) setProfile(data);
            });

        return () => {
            active = false;
        };
    }, [userId]);

    const value = useMemo(() => ({
        session,
        user: session?.user ?? null,
        profile,
        isAdmin: profile?.role === ADMIN_ROLE,
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signUp: (fullName, email, password) => supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: `${WEB_URL}/login`,
            },
        }),
        signOut: () => supabase.auth.signOut({ scope: 'local' }),
    }), [session, profile]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
