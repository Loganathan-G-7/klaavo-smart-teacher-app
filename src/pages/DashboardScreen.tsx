import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Home, BookOpen, CalendarOff, MessageCircle, User, Clock, NotebookPen, FileText, Image, MapPinOff } from "lucide-react";

const classes = [
  { name: "LKG-A", subject: "English", time: "9:30 AM", color: "bg-accent/20 text-accent" },
  { name: "Class 2-B", subject: "Mathematics", time: "10:30 AM", color: "bg-success/20 text-success" },
  { name: "Class 5-B", subject: "Science", time: "11:30 AM", color: "bg-destructive/15 text-destructive" },
  { name: "Class 3-A", subject: "Hindi", time: "1:00 PM", color: "bg-primary/15 text-primary" },
];

const navItems = [
  { icon: Home, label: "Home", active: true, path: "/dashboard" },
  { icon: BookOpen, label: "Classes", active: false, path: "/classes" },
  { icon: CalendarOff, label: "Leave", active: false, path: "/leave" },
  { icon: MessageCircle, label: "Chat", active: false, path: "/chat" },
  { icon: User, label: "Profile", active: false, path: "/profile" },
];

const pad = (n: number) => String(n).padStart(2, "0");

const DashboardScreen = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    if (checkedIn) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkedIn]);

  const handleToggle = () => {
    if (!checkedIn) {
      setCheckedIn(true);
      setCheckInTime(new Date());
      setElapsed(0);
    } else {
      setCheckedIn(false);
    }
  };

  const hh = pad(Math.floor(elapsed / 3600));
  const mm = pad(Math.floor((elapsed % 3600) / 60));
  const ss = pad(elapsed % 60);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">{greeting},</p>
            <h1 className="text-primary-foreground text-xl font-bold">Priya Sharma</h1>
            <p className="text-primary-foreground/60 text-xs mt-0.5">Delhi Public School</p>
          </div>
          <button onClick={() => navigate("/notifications")} className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-primary-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>

        {/* Timer Card */}
        <div className="bg-[#1A1A1A] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-[#2A2A2A] rounded-lg px-3 py-2 min-w-[48px] text-center">
                <span className="text-2xl font-extrabold text-white font-mono">{hh}</span>
              </div>
              <span className="text-2xl font-bold text-white/40">:</span>
              <div className="bg-[#2A2A2A] rounded-lg px-3 py-2 min-w-[48px] text-center">
                <span className="text-2xl font-extrabold text-white font-mono">{mm}</span>
              </div>
              <span className="text-2xl font-bold text-white/40">:</span>
              <div className="bg-[#2A2A2A] rounded-lg px-3 py-2 min-w-[48px] text-center">
                <span className="text-2xl font-extrabold text-white font-mono">{ss}</span>
              </div>
            </div>
            {checkedIn ? (
              <p className="text-xs font-semibold mt-2 text-success">In</p>
            ) : checkInTime ? (
              <p className="text-xs font-semibold mt-2 text-destructive">Out</p>
            ) : (
              <p className="text-xs font-medium mt-2 text-white/40">Not checked in</p>
            )}
          </div>

          <button
            onClick={handleToggle}
            className={`px-5 py-3 rounded-full font-bold text-sm shadow-card-lg transition-all active:scale-95 ${
              checkedIn
                ? "bg-destructive text-destructive-foreground"
                : "bg-success text-success-foreground"
            }`}
          >
            {checkedIn ? "Check-out" : "Check-in"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-24 space-y-6">
        {/* Status Card */}
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Today's Status</p>
            <p className="text-sm font-bold text-foreground">
              {checkedIn && checkInTime
                ? `Checked In at ${checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`
                : "Not Checked In"}
            </p>
          </div>
        </div>

        {/* Classes */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-3">My Classes Today</h3>
          <div className="space-y-3">
            {classes.map((cls) => (
              <div key={cls.name} className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm ${cls.color}`}>
                  {cls.name.split("-")[0].trim().slice(0, 3)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{cls.name}</p>
                  <p className="text-muted-foreground text-xs">{cls.subject}</p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{cls.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border px-4 py-2 flex justify-around items-center shadow-card-lg">
        {navItems.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1 py-1 px-3">
            <item.icon className={`w-5 h-5 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-[10px] font-semibold ${item.active ? "text-primary" : "text-muted-foreground"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardScreen;
