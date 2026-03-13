import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Check, X, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClassData {
  id: string;
  name: string;
  section: string;
  students_count: number;
}

const MyClassesScreen = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const fetchClasses = async () => {
      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("teacher_classes")
        .select("class_id, classes:class_id(id, name, section, students_count)")
        .eq("teacher_id", teacherId);

      if (!error && data) {
        const mapped = data
          .map((row: any) => row.classes)
          .filter(Boolean) as ClassData[];
        setClasses(mapped);
      }
      setLoading(false);
    };
    fetchClasses();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground text-xl font-bold">My Classes</h1>
        </div>
        <p className="text-primary-foreground/60 text-xs ml-12">{today}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-1">No classes assigned</h3>
            <p className="text-muted-foreground text-sm">Contact your admin to get classes assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => navigate(`/class/${cls.id}`, { state: { className: cls.name } })}
                className="bg-card rounded-2xl p-4 shadow-card text-left transition-all active:scale-[0.97] hover:shadow-card-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {cls.name.split("-")[0].trim().slice(0, 3)}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-0.5">{cls.name}</h3>
                <p className="text-muted-foreground text-xs mb-2">Section {cls.section}</p>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {cls.students_count} students
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClassesScreen;
