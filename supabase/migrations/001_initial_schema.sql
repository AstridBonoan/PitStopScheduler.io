-- Pit Stop Scheduler — initial schema

create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  full_name text,
  created_at timestamptz default now()
);

create table public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  duration integer not null,
  price numeric(10, 2) not null,
  created_at timestamptz default now()
);

create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null unique,
  phone text not null,
  created_at timestamptz default now()
);

create table public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  make text not null,
  model text not null,
  year integer not null,
  mileage integer not null,
  license_plate text,
  created_at timestamptz default now()
);

create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  service_id uuid not null references public.services (id),
  appointment_date date not null,
  appointment_time text not null,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'completed', 'rescheduled', 'cancelled')
  ),
  confirmation_number text not null unique,
  notes text,
  google_calendar_event_id text,
  sms_reminder_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index appointments_date_time_unique
  on public.appointments (appointment_date, appointment_time)
  where status != 'cancelled';

create table public.availability (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  time_slot text not null,
  available boolean not null default true,
  unique (date, time_slot)
);

create table public.blocked_dates (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  reason text
);

create table public.holidays (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  name text not null
);

create table public.business_hours (
  id uuid primary key default uuid_generate_v4(),
  day_of_week integer not null check (day_of_week between 0 and 6),
  open_time text not null,
  close_time text not null,
  is_closed boolean not null default false,
  unique (day_of_week)
);

insert into public.services (name, description, duration, price) values
  ('Oil Change', 'Full synthetic or conventional oil change with filter replacement and multi-point inspection.', 45, 49.99),
  ('Tire Rotation', 'Rotate all four tires for even wear. Includes pressure check and visual tread inspection.', 30, 29.99),
  ('Brake Inspection', 'Comprehensive brake system check including pads, rotors, fluid, and safety assessment.', 60, 39.99),
  ('Diagnostic Check', 'Computer diagnostic scan to identify check engine lights, warning codes, and performance issues.', 90, 89.99);

insert into public.business_hours (day_of_week, open_time, close_time, is_closed) values
  (0, '09:00', '13:00', true),
  (1, '09:00', '16:00', false),
  (2, '09:00', '16:00', false),
  (3, '09:00', '16:00', false),
  (4, '09:00', '16:00', false),
  (5, '09:00', '16:00', false),
  (6, '09:00', '13:00', false);

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.appointments enable row level security;
alter table public.availability enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.holidays enable row level security;
alter table public.business_hours enable row level security;

create policy "Services are public read" on public.services for select using (true);

create policy "Customers read own" on public.customers for select
  using (auth.uid() = user_id or email = auth.jwt() ->> 'email');

create policy "Customers insert" on public.customers for insert with check (true);

create policy "Appointments read own" on public.appointments for select
  using (
    exists (
      select 1 from public.customers c
      where c.id = customer_id and (c.user_id = auth.uid() or c.email = auth.jwt() ->> 'email')
    )
  );

create policy "Appointments insert public" on public.appointments for insert with check (true);

create policy "Admin all appointments" on public.appointments for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Availability public read" on public.availability for select using (true);
create policy "Blocked dates public read" on public.blocked_dates for select using (true);
create policy "Holidays public read" on public.holidays for select using (true);
create policy "Business hours public read" on public.business_hours for select using (true);

create policy "Admin manage availability" on public.availability for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admin manage blocked" on public.blocked_dates for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admin manage holidays" on public.holidays for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'customer', new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
