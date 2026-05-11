import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Search, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: number;
  name: string;
  roll_no: number | null;
}

type AttendanceStatus = "P" | "A" | "L" | null;

const StudentListScreen = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const location = useLocation();
  const className = (location.state as any)?.className || "Class";

  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayFormatted = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (!classId) return;
    (async () => {
      setLoading(true);
      const [studentsRes, attendanceRes] = await Promise.all([
        supabase.from("students").select("id, name, roll_no").eq("class_id", classId).order("roll_no", { ascending: true }),
        supabase.from("student_attendance").select("student_id, status").eq("class_id", classId).eq("date", todayStr),
      ]);
      if (studentsRes.error) setError(studentsRes.error.message);
      else setStudents((studentsRes.data || []) as Student[]);
      if (attendanceRes.data && attendanceRes.data.length > 0) {
        const loaded: Record<number, AttendanceStatus> = {};
        attendanceRes.data.forEach((row) => {
          loaded[row.student_id] = row.status as AttendanceStatus;
        });
        setAttendance(loaded);
      }
      setLoading(false);
    })();
  }, [classId, todayStr]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  const handleSave = async () => {
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId || !classId) return;

    const entries = Object.entries(attendance).filter(([, status]) => status !== null);
    if (entries.length === 0) {
      toast({ title: "No attendance marked", description: "Please mark at least one student.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const rows = entries.map(([studentId, status]) => ({
        student_id: Number(studentId),
        class_id: classId,
        date: todayStr,
        status: status as string,
        marked_by: teacherId,
      }));

      // Upsert based on unique constraint (student_id, class_id, date)
      const { error } = await supabase
        .from("student_attendance")
        .upsert(rows, { onConflict: "student_id,class_id,date" });

      if (error) throw error;

      toast({
        title: "Attendance Saved",
        description: `Attendance for ${className} has been saved successfully.`,
      });
      navigate(-1);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-5 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-primary-foreground text-lg font-bold">{className}</h1>
            <p className="text-primary-foreground/60 text-xs">{students.length} students</p>
          </div>
        </div>

        {/* Today's Date */}
        <div className="flex items-center gap-2 mb-4 ml-1">
          <Calendar className="w-3.5 h-3.5 text-primary-foreground/60" />
          <p className="text-primary-foreground/70 text-xs font-medium">{todayFormatted}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-foreground/20"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 px-5 pt-4 pb-24 space-y-2">
        {filtered.map((student) => (
          <div
            key={student.id}
            className="bg-card rounded-xl p-3.5 shadow-card flex items-center gap-3"
          >
            {/* Avatar */}
            <button
              onClick={() =>
                navigate(`/student/${student.id}`, {
                  state: { studentName: student.name, className },
                })
              }
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
            >
              <span className="text-sm font-bold text-primary">
                {getInitials(student.name)}
              </span>
            </button>

            {/* Info */}
            <button
              onClick={() =>
                navigate(`/student/${student.id}`, {
                  state: { studentName: student.name, className },
                })
              }
              className="flex-1 text-left min-w-0"
            >
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground text-sm truncate">
                  {student.name}
                </p>
                {student.feesPending && (
                  <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] px-1.5 py-0 hover:bg-amber-500/20 shrink-0">
                    Fees Pending
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Roll No: {student.roll}</p>
            </button>

            {/* Attendance Buttons */}
            <div className="flex gap-1.5 shrink-0">
              {(["P", "A", "L"] as AttendanceStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setAttendance((prev) => ({
                      ...prev,
                      [student.id]: prev[student.id] === status ? null : status,
                    }))
                  }
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    attendance[student.id] === status
                      ? status === "P"
                        ? "bg-green-500 text-white"
                        : status === "A"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
};

export default StudentListScreen;
