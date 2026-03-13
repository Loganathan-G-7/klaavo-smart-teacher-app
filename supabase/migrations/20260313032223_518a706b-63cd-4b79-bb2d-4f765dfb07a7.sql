
CREATE TABLE public.student_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id integer NOT NULL,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL,
  marked_by uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id, date)
);

ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read student_attendance" ON public.student_attendance FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert student_attendance" ON public.student_attendance FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update student_attendance" ON public.student_attendance FOR UPDATE TO public USING (true);
