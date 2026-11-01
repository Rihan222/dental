-- Noor Dental Atelier appointment storage and database-enforced administrator access.
-- Run this migration in the Supabase SQL Editor or with the Supabase CLI.

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null check (char_length(btrim(patient_name)) between 2 and 160),
  phone text not null check (char_length(btrim(phone)) between 7 and 32),
  email text check (
    email is null
    or (char_length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
  ),
  service text not null check (char_length(btrim(service)) between 1 and 160),
  appointment_date date not null,
  notes text check (notes is null or char_length(notes) <= 2000),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_appointment_date_idx
  on public.appointments (appointment_date);
create index if not exists appointments_status_date_idx
  on public.appointments (status, appointment_date);
create index if not exists appointments_phone_idx
  on public.appointments (phone);
create index if not exists appointments_patient_name_idx
  on public.appointments (lower(patient_name));
create index if not exists appointments_created_at_idx
  on public.appointments (created_at desc);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_clinic_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_clinic_admin() from public;
grant execute on function public.is_clinic_admin() to anon, authenticated;

create or replace function public.set_appointment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_appointment_updated_at();

alter table public.appointments enable row level security;

drop policy if exists "Public can create pending appointments" on public.appointments;
create policy "Public can create pending appointments"
  on public.appointments
  for insert
  to anon, authenticated
  with check (status = 'pending' and appointment_date >= current_date);

drop policy if exists "Clinic admins can read appointments" on public.appointments;
create policy "Clinic admins can read appointments"
  on public.appointments
  for select
  to authenticated
  using ((select public.is_clinic_admin()));

drop policy if exists "Clinic admins can update appointment status" on public.appointments;
create policy "Clinic admins can update appointment status"
  on public.appointments
  for update
  to authenticated
  using ((select public.is_clinic_admin()))
  with check ((select public.is_clinic_admin()));

drop policy if exists "Clinic admins can delete appointments" on public.appointments;
create policy "Clinic admins can delete appointments"
  on public.appointments
  for delete
  to authenticated
  using ((select public.is_clinic_admin()));

revoke all on table public.appointments from anon, authenticated;
grant insert (patient_name, phone, email, service, appointment_date, notes)
  on public.appointments to anon, authenticated;
grant select, delete on public.appointments to authenticated;
grant update (status) on public.appointments to authenticated;

-- Realtime changes are still filtered by the table's SELECT policy.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'appointments'
     ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
end;
$$;
