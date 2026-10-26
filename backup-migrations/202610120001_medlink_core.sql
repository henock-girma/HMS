-- MedLink multi-tenant healthcare coordination schema
create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('platform','hospital','health_center','pharmacy','diagnostic_center')),
  license_number text,
  region_id text,
  status text not null default 'pending' check (status in ('pending','active','suspended','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text not null,
  active boolean not null default true,
  unique (organization_id, code)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  full_name text not null,
  employee_number text unique,
  role text not null,
  permissions text[] not null default '{}',
  organization_id uuid references public.organizations(id),
  region_id text,
  department_id uuid references public.departments(id),
  status text not null default 'active' check (status in ('invited','active','suspended','revoked')),
  must_change_password boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_memberships (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  fayda_reference text unique,
  hospital_card_number text,
  full_name text not null,
  mobile text,
  email text,
  date_of_birth date,
  home_region text,
  created_at timestamptz not null default now()
);

create table if not exists public.patient_user_links (
  patient_id uuid not null references public.patients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null default 'self' check (relationship in ('self','guardian','caregiver')),
  verified_at timestamptz,
  primary key (patient_id, user_id)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  referring_organization_id uuid references public.organizations(id),
  receiving_organization_id uuid references public.organizations(id),
  department_id uuid references public.departments(id),
  specialty text not null,
  clinical_summary text,
  urgency text not null default 'routine' check (urgency in ('routine','urgent','emergency')),
  status text not null default 'submitted' check (status in ('draft','submitted','verification','triage','more_information','accepted','scheduled','consulted','completed','declined','cancelled')),
  assigned_to uuid references public.profiles(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referral_status_history (
  id bigint generated always as identity primary key,
  referral_id uuid not null references public.referrals(id) on delete cascade,
  status text not null,
  note text,
  visible_to_patient boolean not null default true,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  referral_id uuid references public.referrals(id),
  organization_id uuid not null references public.organizations(id),
  department_id uuid references public.departments(id),
  clinician_id uuid references public.profiles(id),
  starts_at timestamptz not null,
  arrival_instructions text,
  preparation_instructions text,
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','checked_in','completed','missed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.consultation_applications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  preferred_organization_id uuid references public.organizations(id),
  specialty text not null,
  reason text not null,
  preferred_channel text not null default 'in_person' check (preferred_channel in ('in_person','phone','video')),
  status text not null default 'submitted' check (status in ('draft','submitted','under_review','approved','scheduled','completed','declined','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  prescribing_clinician_id uuid references public.profiles(id),
  pharmacy_organization_id uuid references public.organizations(id),
  prescription jsonb not null,
  quoted_amount numeric(12,2),
  patient_consented_at timestamptz,
  status text not null default 'searching' check (status in ('searching','quoted','approved','preparing','dispatched','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pharmacy_inventory (
  id uuid primary key default gen_random_uuid(),
  pharmacy_organization_id uuid not null references public.organizations(id) on delete cascade,
  medicine_name text not null,
  strength text,
  quantity integer not null default 0,
  unit_price numeric(12,2),
  batch_number text,
  expires_on date,
  updated_at timestamptz not null default now()
);

create table if not exists public.diagnostic_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  requesting_organization_id uuid references public.organizations(id),
  diagnostic_organization_id uuid references public.organizations(id),
  investigation text not null,
  chain_of_custody jsonb not null default '[]',
  result_reference text,
  status text not null default 'requested' check (status in ('requested','accepted','sample_collected','in_transit','processing','result_ready','returned','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id),
  medication_order_id uuid references public.medication_orders(id),
  diagnostic_order_id uuid references public.diagnostic_orders(id),
  courier_id uuid references public.profiles(id),
  pickup_address text,
  delivery_address text,
  status text not null default 'unassigned' check (status in ('unassigned','assigned','picked_up','in_transit','delivered','failed','cancelled')),
  proof_of_handover jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((medication_order_id is not null) <> (diagnostic_order_id is not null))
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default true,
  appointment_reminders boolean not null default true,
  referral_updates boolean not null default true,
  consultation_updates boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  patient_id uuid references public.patients(id),
  channel text not null check (channel in ('email','sms')),
  recipient text not null,
  template_key text not null,
  subject text,
  payload jsonb not null default '{}',
  status text not null default 'queued' check (status in ('queued','processing','sent','failed','cancelled')),
  attempts integer not null default 0,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  organization_id uuid references public.organizations(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from profiles where id = auth.uid() and role = 'super_admin' and status = 'active') $$;

create or replace function public.current_organization_id() returns uuid
language sql stable security definer set search_path = public
as $$ select organization_id from profiles where id = auth.uid() and status = 'active' $$;

create or replace function public.has_permission(required_permission text) returns boolean
language sql stable security definer set search_path = public
as $$ select exists(
  select 1 from profiles
  where id = auth.uid() and status = 'active'
  and ('*' = any(permissions) or required_permission = any(permissions))
) $$;

alter table public.organizations enable row level security;
alter table public.departments enable row level security;
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.team_memberships enable row level security;
alter table public.patients enable row level security;
alter table public.patient_user_links enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_status_history enable row level security;
alter table public.appointments enable row level security;
alter table public.consultation_applications enable row level security;
alter table public.medication_orders enable row level security;
alter table public.pharmacy_inventory enable row level security;
alter table public.diagnostic_orders enable row level security;
alter table public.deliveries enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_queue enable row level security;
alter table public.audit_events enable row level security;

create policy "super admins manage organizations" on public.organizations for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "users read own organization" on public.organizations for select using (id = public.current_organization_id());
create policy "organization members read departments" on public.departments for select using (organization_id = public.current_organization_id() or public.is_super_admin());
create policy "organization members read teams" on public.teams for select using (organization_id = public.current_organization_id() or public.is_super_admin());
create policy "users read own profile" on public.profiles for select using (id = auth.uid() or public.is_super_admin());
create policy "super admins manage profiles" on public.profiles for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "users read own team memberships" on public.team_memberships for select using (user_id = auth.uid() or public.is_super_admin());
create policy "patients read linked identity" on public.patients for select using (exists(select 1 from patient_user_links l where l.patient_id = patients.id and l.user_id = auth.uid()) or public.is_super_admin());
create policy "authorized staff read patients" on public.patients for select using ((public.has_permission('patients.read') or public.has_permission('patients.assigned.read') or public.has_permission('patients.register')) and public.current_organization_id() is not null);
create policy "patients read own links" on public.patient_user_links for select using (user_id = auth.uid() or public.is_super_admin());
create policy "patients read own referrals" on public.referrals for select using (exists(select 1 from patient_user_links l where l.patient_id = referrals.patient_id and l.user_id = auth.uid()) or receiving_organization_id = public.current_organization_id() or referring_organization_id = public.current_organization_id() or public.is_super_admin());
create policy "authorized staff manage referrals" on public.referrals for all using ((public.has_permission('referrals.manage') or public.has_permission('referrals.write')) and (receiving_organization_id = public.current_organization_id() or referring_organization_id = public.current_organization_id())) with check ((public.has_permission('referrals.manage') or public.has_permission('referrals.write')) and (receiving_organization_id = public.current_organization_id() or referring_organization_id = public.current_organization_id()));
create policy "patients read visible history" on public.referral_status_history for select using ((visible_to_patient and exists(select 1 from referrals r join patient_user_links l on l.patient_id=r.patient_id where r.id=referral_id and l.user_id=auth.uid())) or public.is_super_admin());
create policy "authorized staff add referral history" on public.referral_status_history for insert with check ((public.has_permission('referrals.manage') or public.has_permission('referrals.write')) and exists(select 1 from referrals r where r.id=referral_id and (r.receiving_organization_id=public.current_organization_id() or r.referring_organization_id=public.current_organization_id())));
create policy "patients read own appointments" on public.appointments for select using (exists(select 1 from patient_user_links l where l.patient_id=appointments.patient_id and l.user_id=auth.uid()) or organization_id=public.current_organization_id() or public.is_super_admin());
create policy "authorized staff manage appointments" on public.appointments for all using (public.has_permission('appointments.manage') and organization_id=public.current_organization_id()) with check (public.has_permission('appointments.manage') and organization_id=public.current_organization_id());
create policy "patients manage own consultations" on public.consultation_applications for all using (exists(select 1 from patient_user_links l where l.patient_id=consultation_applications.patient_id and l.user_id=auth.uid()) or public.is_super_admin()) with check (exists(select 1 from patient_user_links l where l.patient_id=consultation_applications.patient_id and l.user_id=auth.uid()) or public.is_super_admin());
create policy "patients read own medication orders" on public.medication_orders for select using (exists(select 1 from patient_user_links l where l.patient_id=medication_orders.patient_id and l.user_id=auth.uid()) or public.is_super_admin());
create policy "pharmacies manage assigned orders" on public.medication_orders for all using (public.has_permission('orders.manage') and pharmacy_organization_id=public.current_organization_id()) with check (public.has_permission('orders.manage') and pharmacy_organization_id=public.current_organization_id());
create policy "pharmacies manage own inventory" on public.pharmacy_inventory for all using ((public.has_permission('inventory.write') or public.has_permission('inventory.manage')) and pharmacy_organization_id=public.current_organization_id()) with check ((public.has_permission('inventory.write') or public.has_permission('inventory.manage')) and pharmacy_organization_id=public.current_organization_id());
create policy "patients read own diagnostics" on public.diagnostic_orders for select using (exists(select 1 from patient_user_links l where l.patient_id=diagnostic_orders.patient_id and l.user_id=auth.uid()) or public.is_super_admin());
create policy "labs manage assigned diagnostics" on public.diagnostic_orders for all using (public.has_permission('diagnostics.manage') and diagnostic_organization_id=public.current_organization_id()) with check (public.has_permission('diagnostics.manage') and diagnostic_organization_id=public.current_organization_id());
create policy "couriers read assigned deliveries" on public.deliveries for select using (courier_id=auth.uid() or public.has_permission('dispatch.manage') or public.is_super_admin());
create policy "couriers update assigned deliveries" on public.deliveries for update using (courier_id=auth.uid() and public.has_permission('deliveries.status.write')) with check (courier_id=auth.uid());
create policy "users manage notification preferences" on public.notification_preferences for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "users read own notifications" on public.notification_queue for select using (user_id=auth.uid() or public.is_super_admin());
create policy "super admins read audit" on public.audit_events for select using (public.is_super_admin());

create index if not exists referrals_patient_idx on public.referrals(patient_id);
create index if not exists referrals_org_status_idx on public.referrals(receiving_organization_id, status);
create index if not exists appointments_patient_time_idx on public.appointments(patient_id, starts_at);
create index if not exists notification_queue_delivery_idx on public.notification_queue(status, scheduled_for);
create index if not exists medication_orders_pharmacy_status_idx on public.medication_orders(pharmacy_organization_id, status);
create index if not exists diagnostic_orders_lab_status_idx on public.diagnostic_orders(diagnostic_organization_id, status);
create index if not exists deliveries_courier_status_idx on public.deliveries(courier_id, status);
create index if not exists audit_events_actor_time_idx on public.audit_events(actor_id, created_at desc);
