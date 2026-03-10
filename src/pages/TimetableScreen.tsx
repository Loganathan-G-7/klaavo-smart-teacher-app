import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timetableData: Record<string, { period: number; subject: string; class: string; time: string; isFree?: boolean }[]> = {
  Mon: [
    { period: 1, subject: "English", class: "LKG-A", time: "9:00 - 9:45" },
    { period: 2, subject: "Mathematics", class: "Class 2-B", time: "9:45 - 10:30" },
    { period: 3, subject: "Free Period", class: "-", time: "10:30 - 11:15", isFree: true },
    { period: 4, subject: "Science", class: "Class 5-B", time: "11:30 - 12:15" },
    { period: 5, subject: "Hindi", class: "Class 3-A", time: "12:15 - 1:00" },
    { period: 6, subject: "English", class: "UKG-B", time: "2:00 - 2:45" },
  ],
  Tue: [
    { period: 1, subject: "Mathematics", class: "Class 3-A", time: "9:00 - 9:45" },
    { period: 2, subject: "Science", class: "Class 5-B", time: "9:45 - 10:30" },
    { period: 3, subject: "English", class: "LKG-A", time: "10:30 - 11:15" },
    { period: 4, subject: "Free Period", class: "-", time: "11:30 - 12:15", isFree: true },
    { period: 5, subject: "Hindi", class: "Class 2-B", time: "12:15 - 1:00" },
    { period: 6, subject: "Art", class: "UKG-B", time: "2:00 - 2:45" },
  ],
  Wed: [
    { period: 1, subject: "Science", class: "Class 5-B", time: "9:00 - 9:45" },
    { period: 2, subject: "English", class: "LKG-A", time: "9:45 - 10:30" },
    { period: 3, subject: "Mathematics", class: "Class 2-B", time: "10:30 - 11:15" },
    { period: 4, subject: "Hindi", class: "Class 3-A", time: "11:30 - 12:15" },
    { period: 5, subject: "Free Period", class: "-", time: "12:15 - 1:00", isFree: true },
    { period: 6, subject: "English", class: "UKG-B", time: "2:00 - 2:45" },
  ],
  Thu: [
    { period: 1, subject: "Hindi", class: "Class 3-A", time: "9:00 - 9:45" },
    { period: 2, subject: "English", class: "LKG-A", time: "9:45 - 10:30" },
    { period: 3, subject: "Science", class: "Class 5-B", time: "10:30 - 11:15" },
    { period: 4, subject: "Mathematics", class: "Class 2-B", time: "11:30 - 12:15" },
    { period: 5, subject: "English", class: "UKG-B", time: "12:15 - 1:00" },
    { period: 6, subject: "Free Period", class: "-", time: "2:00 - 2:45", isFree: true },
  ],
  Fri: [
    { period: 1, subject: "Mathematics", class: "Class 2-B", time: "9:00 - 9:45" },
    { period: 2, subject: "Hindi", class: "Class 3-A", time: "9:45 - 10:30" },
    { period: 3, subject: "English", class: "LKG-A", time: "10:30 - 11:15" },
    { period: 4, subject: "Science", class: "Class 5-B", time: "11:30 - 12:15" },
    { period: 5, subject: "Art", class: "UKG-B", time: "12:15 - 1:00" },
    { period: 6, subject: "Free Period", class: "-", time: "2:00 - 2:45", isFree: true },
  ],
  Sat: [
    { period: 1, subject: "English", class: "LKG-A", time: "9:00 - 9:45" },
    { period: 2, subject: "Mathematics", class: "Class 2-B", time: "9:45 - 10:30" },
    { period: 3, subject: "Science", class: "Class 5-B", time: "10:30 - 11:15" },
  ],
};

const getCurrentPeriod = () => {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const t = h * 60 + m;
  if (t >= 540 && t < 585) return 1;
  if (t >= 585 && t < 630) return 2;
  if (t >= 630 && t < 675) return 3;
  if (t >= 690 && t < 735) return 4;
  if (t >= 735 && t < 780) return 5;
  if (t >= 840 && t < 885) return 6;
  return -1;
};

const TimetableScreen = () => {
  const navigate = useNavigate();
  const todayIndex = Math.min(new Date().getDay() - 1, 5);
  const [selectedDay, setSelectedDay] = useState(days[Math.max(todayIndex, 0)]);
  const periods = timetableData[selectedDay] || [];
  const currentPeriod = selectedDay === days[Math.max(todayIndex, 0)] ? getCurrentPeriod() : -1;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-primary px-6 pt-8 pb-5 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">My Timetable</h1>
        </div>
        <div className="flex gap-2">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDay === d
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary-foreground/10 text-primary-foreground/70"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pt-5 pb-8 space-y-3">
        {periods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Clock className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-semibold">No classes scheduled</p>
          </div>
        ) : (
          periods.map((p) => (
            <div
              key={p.period}
              className={`rounded-xl p-4 flex items-center gap-4 transition-all ${
                p.isFree
                  ? "bg-muted border border-border"
                  : currentPeriod === p.period
                  ? "bg-primary text-primary-foreground shadow-card-lg"
                  : "bg-card shadow-card"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-sm ${
                  p.isFree
                    ? "bg-muted-foreground/10 text-muted-foreground"
                    : currentPeriod === p.period
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                P{p.period}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${currentPeriod === p.period ? "text-primary-foreground" : p.isFree ? "text-muted-foreground" : "text-foreground"}`}>
                  {p.subject}
                </p>
                <p className={`text-xs ${currentPeriod === p.period ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {p.class}
                </p>
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${currentPeriod === p.period ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {p.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TimetableScreen;
