import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Check, X } from "lucide-react";

const classesData = [
  { id: 1, name: "LKG-A", section: "A", students: 32, attendanceDone: true },
  { id: 2, name: "LKG-B", section: "B", students: 30, attendanceDone: false },
  { id: 3, name: "Class 1-A", section: "A", students: 35, attendanceDone: true },
  { id: 4, name: "Class 2-B", section: "B", students: 28, attendanceDone: false },
  { id: 5, name: "Class 3-A", section: "A", students: 34, attendanceDone: true },
  { id: 6, name: "Class 5-B", section: "B", students: 31, attendanceDone: false },
];

const MyClassesScreen = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

      {/* Grid */}
      <div className="flex-1 px-5 pt-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {classesData.map((cls) => (
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
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    cls.attendanceDone
                      ? "bg-success/15"
                      : "bg-destructive/15"
                  }`}
                >
                  {cls.attendanceDone ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <X className="w-4 h-4 text-destructive" />
                  )}
                </div>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-0.5">{cls.name}</h3>
              <p className="text-muted-foreground text-xs mb-2">Section {cls.section}</p>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {cls.students} students
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyClassesScreen;
