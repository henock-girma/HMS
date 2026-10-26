alter table public.organizations
  add column if not exists user_seat_limit integer not null default 10,
  add column if not exists partner_admin_id uuid references public.profiles(id),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id);

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  organization_type text not null check (organization_type in ('hospital','pharmacy','diagnostic_center','health_center')),
  license_number text not null,
  region_id text,
  representative_name text not null,
  representative_email text not null,
  requested_seats integer not null default 10 check (requested_seats between 1 and 10000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.home_care_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id),
  organization_id uuid references public.organizations(id),
  assigned_to uuid references public.profiles(id),
  service_type text not null default 'home_visit',
  requested_for timestamptz,
  address text not null,
  clinical_notes text,
  status text not null default 'requested' check (status in ('requested','triage','scheduled','in_progress','completed','cancelled')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id),
  organization_id uuid references public.organizations(id),
  assigned_to uuid references public.profiles(id),
  due_at timestamptz not null,
  channel text not null default 'phone' check (channel in ('phone','sms','home_visit','in_person')),
  notes text,
  status text not null default 'open' check (status in ('open','in_progress','completed','missed','cancelled')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partner_applications enable row level security;
alter table public.home_care_requests enable row level security;
alter table public.follow_up_tasks enable row level security;

create policy "public can submit partner applications" on public.partner_applications for insert with check (true);
create policy "super admins manage partner applications" on public.partner_applications for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy "authorized staff manage home care" on public.home_care_requests for all using (public.is_super_admin() or organization_id = public.current_organization_id()) with check (public.is_super_admin() or organization_id = public.current_organization_id());
create policy "authorized staff manage follow ups" on public.follow_up_tasks for all using (public.is_super_admin() or organization_id = public.current_organization_id()) with check (public.is_super_admin() or organization_id = public.current_organization_id());
