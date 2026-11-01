import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteAppointment,
  fetchAppointments,
  subscribeToAppointmentChanges,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from '../lib/appointments';
import { supabaseConfigured } from '../lib/supabase';

export function useAppointments(enabled: boolean) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const requestGeneration = useRef(0);

  const refresh = useCallback(async (showLoader = false) => {
    if (!enabled || !supabaseConfigured) return;
    const generation = ++requestGeneration.current;
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const rows = await fetchAppointments();
      if (generation !== requestGeneration.current) return;
      setAppointments(rows);
      setError(null);
    } catch (cause) {
      if (generation !== requestGeneration.current) return;
      setError(cause instanceof Error ? cause.message : 'Could not load appointments.');
    } finally {
      if (generation === requestGeneration.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      requestGeneration.current += 1;
      setAppointments([]);
      setLoading(false);
      setError(null);
      setSavingId(null);
      return;
    }
    if (!supabaseConfigured) {
      requestGeneration.current += 1;
      setLoading(false);
      setError('Supabase is not configured.');
      return;
    }

    void refresh(true);
    const unsubscribe = subscribeToAppointmentChanges(() => {
      void refresh(false);
    });
    return () => {
      requestGeneration.current += 1;
      unsubscribe();
    };
  }, [enabled, refresh]);

  const setStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    const generation = requestGeneration.current;
    setSavingId(id);
    try {
      const updated = await updateAppointmentStatus(id, status);
      if (generation === requestGeneration.current && enabled) {
        setAppointments((current) => current.map((row) => row.id === id ? updated : row));
      }
      setError(null);
      return updated;
    } finally {
      if (generation === requestGeneration.current) setSavingId(null);
    }
  }, [enabled]);

  const remove = useCallback(async (id: string) => {
    const generation = requestGeneration.current;
    setSavingId(id);
    try {
      await deleteAppointment(id);
      if (generation === requestGeneration.current && enabled) {
        setAppointments((current) => current.filter((row) => row.id !== id));
      }
      setError(null);
    } finally {
      if (generation === requestGeneration.current) setSavingId(null);
    }
  }, [enabled]);

  return {
    appointments,
    loading,
    refreshing,
    error,
    savingId,
    refresh: () => refresh(false),
    setStatus,
    remove,
  };
}
