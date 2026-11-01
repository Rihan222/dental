import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured, supabaseConfigurationError } from '../lib/supabase';

export type AdminAuthStatus =
  | 'unconfigured'
  | 'invalid-config'
  | 'loading'
  | 'signed-out'
  | 'checking-admin'
  | 'admin'
  | 'unauthorized'
  | 'error';

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AdminAuthStatus>(
    supabaseConfigurationError ? 'invalid-config' : supabaseConfigured ? 'loading' : 'unconfigured',
  );
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setStatus(supabaseConfigurationError ? 'invalid-config' : 'unconfigured');
      return;
    }

    const client = supabase;
    let active = true;
    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthError(null);
      setStatus(nextSession ? 'checking-admin' : 'signed-out');
    });

    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuthError(error.message);
        setStatus('error');
        return;
      }
      setSession(data.session);
      setStatus(data.session ? 'checking-admin' : 'signed-out');
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session) return;
    let active = true;
    setStatus('checking-admin');
    void supabase.rpc('is_clinic_admin').then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuthError(error.message);
        setStatus('error');
        return;
      }
      setAuthError(null);
      setStatus(data === true ? 'admin' : 'unauthorized');
    });
    return () => {
      active = false;
    };
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return {
    configured: supabaseConfigured,
    session,
    status,
    authError,
    signIn,
    signOut,
  };
}
