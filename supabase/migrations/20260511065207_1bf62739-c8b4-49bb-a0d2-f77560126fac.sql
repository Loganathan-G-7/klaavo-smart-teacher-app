-- diary entries
create table public.diary (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  class_id uuid,
  date date not null default current_date,
  subject text,
  topic text,
  homework text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.diary enable row level security;
create policy "Anyone can read diary" on public.diary for select using (true);
create policy "Anyone can insert diary" on public.diary for insert with check (true);
create policy "Anyone can update diary" on public.diary for update using (true);

-- leave requests
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  leave_type text not null,
  from_date date not null,
  to_date date not null,
  reason text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.leave_requests enable row level security;
create policy "Anyone can read leave_requests" on public.leave_requests for select using (true);
create policy "Anyone can insert leave_requests" on public.leave_requests for insert with check (true);
create policy "Anyone can update leave_requests" on public.leave_requests for update using (true);

-- students
create table public.students (
  id serial primary key,
  class_id uuid not null,
  name text not null,
  roll_no int,
  photo_url text,
  created_at timestamptz not null default now()
);
alter table public.students enable row level security;
create policy "Anyone can read students" on public.students for select using (true);