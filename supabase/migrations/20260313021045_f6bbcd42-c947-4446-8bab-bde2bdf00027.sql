
-- Classes table
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  section text NOT NULL,
  students_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Junction table for teacher-class assignments
CREATE TABLE public.teacher_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, class_id)
);

-- RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read classes" ON public.classes FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read teacher_classes" ON public.teacher_classes FOR SELECT TO public USING (true);

-- Seed some classes
INSERT INTO public.classes (name, section, students_count) VALUES
  ('LKG-A', 'A', 32),
  ('LKG-B', 'B', 30),
  ('Class 1-A', 'A', 35);

-- Assign all 3 classes to the test teacher (Priya Sharma)
INSERT INTO public.teacher_classes (teacher_id, class_id)
SELECT t.id, c.id FROM public.teachers t, public.classes c WHERE t.phone = '9876543210';
