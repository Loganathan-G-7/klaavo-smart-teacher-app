## Current State

Already wired to Supabase:
- OTPScreen → `teachers` lookup by phone, saves `teacher_id` etc to localStorage
- DashboardScreen → fetches teacher + today's attendance, supports check-in
- CheckInScreen → inserts to `attendance` with GPS
- MyClassesScreen → fetches teacher's classes via `teacher_classes`
- StudentListScreen → reads/writes `student_attendance`
- LeaveScreen → reads `attendance` history
- TeacherAttendanceScreen / AttendanceDetailsScreen → read `attendance`

Not yet wired (all use mock/static data):
- LoginScreen (only collects phone, no validation against `teachers`)
- DailyDiaryScreen (no `diary` table exists)
- ProfileScreen (no Supabase reads)
- LeaveScreen "Leave" tab (no `leave_requests` table exists)
- StudentListScreen students list (no `students` table exists — currently mocked)

## Plan

### 1. Database migrations (new tables)

```sql
-- diary entries written by teachers per class/date
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

-- leave requests
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  leave_type text not null,
  from_date date not null,
  to_date date not null,
  reason text,
  status text not null default 'pending', -- pending/approved/rejected
  created_at timestamptz not null default now()
);

-- students (referenced by student_attendance.student_id int — keep int id)
create table public.students (
  id serial primary key,
  class_id uuid not null,
  name text not null,
  roll_no int,
  photo_url text,
  created_at timestamptz not null default now()
);
```

Public-read RLS + public insert/update for `diary` and `leave_requests` (matches existing app pattern, no auth.uid()). Students: public read only.

### 2. Screen wiring

- **LoginScreen**: on submit, query `teachers` by phone. If no match → show "Mobile not registered" toast and stay. If match → navigate to OTP with phone (current OTP flow already saves session).
- **DailyDiaryScreen**: fetch `diary` rows for current teacher; form to insert new entries; loading + empty state.
- **ProfileScreen**: read teacher row from `teachers` by `teacher_id` from localStorage, render name/designation/department/school/phone; loading + error state.
- **LeaveScreen (Leave tab)**: fetch `leave_requests` for teacher; "New request" form inserts row; show pending/approved/rejected badges.
- **StudentListScreen**: replace mock students with `students` query filtered by `class_id` from route param; keep existing attendance write path.

### 3. Loading/error states

Add `loading` and `error` state to each new wiring (skeleton + retry button or empty state). Keep existing wired screens as-is unless they lack states.

### 4. localStorage keys

Already saving `teacher_id`, `teacher_name`, `teacher_designation`, `teacher_department`, `teacher_school` in OTPScreen. Add:
- `school_id` (not currently a column on `teachers` — use `school_name` as id surrogate, or skip until schema has schools)
- `permissions` — no permissions model yet; skip unless you want a roles table

### Out of scope (ask before adding)

- `school_id` / `permissions` infrastructure (no schools or roles table exist; would need its own migration + admin UI)
- Auth via Supabase Auth (current flow uses test OTP "1234" only — no real session)

## Confirm before I proceed

I will:
1. Run migrations for `diary`, `leave_requests`, `students` (with seed-friendly RLS)
2. Wire LoginScreen, DailyDiaryScreen, ProfileScreen, LeaveScreen leave tab, StudentListScreen students fetch
3. Skip `school_id` / `permissions` until you confirm the data model

Reply "go" to run migrations and apply edits, or tell me what to change.