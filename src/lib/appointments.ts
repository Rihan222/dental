import { requireSupabase } from './supabase';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string | null;
  service: string;
  appointment_date: string;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface NewAppointment {
  patient_name: string;
  phone: string;
  email: string | null;
  service: string;
  appointment_date: string;
  notes: string | null;
}

const BATCH_SIZE = 500;

export async function createAppointment(appointment: NewAppointment) {
  const client = requireSupabase();
  const { error } = await client.from('appointments').insert(appointment);
  if (error) throw error;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const client = requireSupabase();
  const appointments: Appointment[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await client
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) throw error;
    const batch = (data ?? []) as Appointment[];
    appointments.push(...batch);
    if (batch.length < BATCH_SIZE) return appointments;
    offset += BATCH_SIZE;
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function deleteAppointment(id: string) {
  const client = requireSupabase();
  const { error } = await client
    .from('appointments')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error) throw error;
}

export function subscribeToAppointmentChanges(onChange: () => void) {
  const client = requireSupabase();
  const channel = client
    .channel('admin-appointments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      onChange,
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onChange();
    });

  return () => {
    void client.removeChannel(channel);
  };
}
