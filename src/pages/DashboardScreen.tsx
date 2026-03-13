import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Home, BookOpen, CalendarOff, MessageCircle, User, Clock, NotebookPen, FileText, Image, MapPinOff, CalendarDays, ClipboardList, ShieldCheck, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

type AttendanceStatus = "absent" | "early" | "on_time" | "late" | "checked_out";

const DashboardScreen = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [totalDuration, setTotalDuration] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [schoolName, setSchoolName] = useState("Delhi Public School");
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutTime, setCheckoutTime] = useState<string>("");
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const getAttendanceStatus = (): AttendanceStatus => {
    if (checkedOut) return "checked_out";
    if (!checkedIn || !checkInTime) return "absent";
    const h = checkInTime.getHours();
    const m = checkInTime.getMinutes();
    const totalMin = h * 60 + m;
    if (totalMin < 510) return "early"; // before 8:30
    if (totalMin <= 540) return "on_time"; // 8:30 - 9:00
    return "late"; // after 9:00
  };

  useEffect(() => {
    const storedName = localStorage.getItem("teacher_name");
    const storedSchool = localStorage.getItem("teacher_school");
    if (storedName) setTeacherName(storedName);
    if (storedSchool) setSchoolName(storedSchool);

    const checkTodayAttendance = async () => {
      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) return;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.check_in) {
        setAttendanceId(data.id);
        const [h, m, s] = data.check_in.split(":").map(Number);
        const ci = new Date();
        ci.setHours(h, m, s || 0, 0);
        setCheckInTime(ci);

        if (data.check_out) {
          setCheckedOut(true);
          setCheckedIn(false);
          const [oh, om, os] = data.check_out.split(":").map(Number);
          const co = new Date();
          co.setHours(oh, om, os || 0, 0);
          const diffMs = co.getTime() - ci.getTime();
          const totalH = Math.floor(diffMs / 3600000);
          const totalM = Math.floor((diffMs % 3600000) / 60000);
          setTotalDuration(`${totalH}h ${pad(totalM)}m`);
        } else {
          setCheckedIn(true);
          setCheckedOut(false);
          setElapsed(Math.floor((Date.now() - ci.getTime()) / 1000));
        }
      }
    };
    checkTodayAttendance();
  }, []);

  useEffect(() => {
    if (checkedIn && !checkedOut) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkedIn, checkedOut]);

  const requestLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });
  };

  const handleCheckIn = async () => {
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId) {
      toast.error("Teacher not found. Please login again.");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    setCheckingIn(true);
    try {
      const position = await requestLocation();
      const { latitude, longitude } = position.coords;

      const { data, error } = await supabase.from("attendance").insert({
        teacher_id: teacherId,
        date: today,
        check_in: currentTime,
        status: "present",
        latitude,
        longitude,
      } as any).select().single();

      if (error) {
        console.error("Check-in error:", error);
        toast.error("Check-in failed");
        return;
      }
      setAttendanceId(data?.id || null);
      setCheckedIn(true);
      setCheckedOut(false);
      setCheckInTime(now);
      setElapsed(0);
      toast.success("Checked in successfully!");
    } catch (err: any) {
      if (err.code === 1) {
        toast.error("Please enable location to check in");
      } else {
        toast.error("Could not get location. Please try again.");
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOutRequest = () => {
    const now = new Date();
    setCheckoutTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    setShowCheckoutDialog(true);
  };

  const handleCheckOutConfirm = async () => {
    setShowCheckoutDialog(false);
    const teacherId = localStorage.getItem("teacher_id");
    if (!teacherId) return;

    setCheckingOut(true);
    try {
      const position = await requestLocation();
      const { latitude, longitude } = position.coords;

      const now = new Date();
      const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const today = now.toISOString().split("T")[0];

      const updateQuery = supabase
        .from("attendance")
        .update({ check_out: currentTime, longitude, latitude } as any);

      if (attendanceId) {
        await updateQuery.eq("id", attendanceId);
      } else {
        await updateQuery.eq("teacher_id", teacherId).eq("date", today);
      }

      setCheckedIn(false);
      setCheckedOut(true);
      if (checkInTime) {
        const diffMs = Date.now() - checkInTime.getTime();
        const totalH = Math.floor(diffMs / 3600000);
        const totalM = Math.floor((diffMs % 3600000) / 60000);
        setTotalDuration(`${totalH}h ${pad(totalM)}m`);
      }
      toast.success("Checked out successfully!");
    } catch (err: any) {
      if (err.code === 1) {
        toast.error("Please enable location to check out");
      } else {
        toast.error("Could not get location. Please try again.");
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCheckInAgain = () => {
    setCheckedOut(false);
    setCheckedIn(false);
    setCheckInTime(null);
    setElapsed(0);
    setAttendanceId(null);
    setTotalDuration("");
  };

  const hh = pad(Math.floor(elapsed / 3600));
  const mm = pad(Math.floor((elapsed % 3600) / 60));
  const ss = pad(elapsed % 60);

  const status = getAttendanceStatus();

  const statusConfig: Record<AttendanceStatus, { icon: string; iconColor: string; text: string; textColor: string }> = {
    absent: { icon: "bg-destructive/15", iconColor: "text-destructive", text: "Absent", textColor: "text-destructive" },
    early: {
      icon: "bg-blue-500/15",
      iconColor: "text-blue-500",
      text: checkInTime ? `Checked In at ${checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} (Early)` : "Early",
      textColor: "text-blue-500",
    },
    on_time: {
      icon: "bg-success/15",
      iconColor: "text-success",
      text: checkInTime ? `Checked In at ${checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}` : "On Time",
      textColor: "text-success",
    },
    checked_out: { icon: "bg-success/15", iconColor: "text-success", text: `Present for ${totalDuration}`, textColor: "text-success" },
    late: {
      icon: "bg-amber-500/15",
      iconColor: "text-amber-500",
      text: checkInTime ? `Checked In at ${checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} (Late)` : "Late",
      textColor: "text-amber-500",
    },
  };

  const sc = statusConfig[status];

  const getButtonLabel = () => {
    if (checkingIn) return "Locating...";
    if (checkingOut) return "Locating...";
    if (checkedIn) return "Check-out";
    if (checkedOut) return "Check In Again?";
    return "Check-in";
  };

  const getButtonStyle = () => {
    if (checkedIn) return "bg-destructive text-destructive-foreground";
    if (checkedOut) return "bg-accent text-accent-foreground";
    return "bg-success text-success-foreground";
  };

  const handleButtonClick = () => {
    if (checkedIn) {
      handleCheckOutRequest();
    } else if (checkedOut) {
      handleCheckInAgain();
    } else {
      handleCheckIn();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">{greeting},</p>
            <h1 className="text-primary-foreground text-xl font-bold">{teacherName}</h1>
            <p className="text-primary-foreground/60 text-xs mt-0.5">{schoolName}</p>
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
            ) : checkedOut ? (
              <p className="text-xs font-semibold mt-2 text-muted-foreground">Completed</p>
            ) : (
              <p className="text-xs font-medium mt-2 text-white/40">Not checked in</p>
            )}
          </div>

          <button
            onClick={handleButtonClick}
            disabled={checkingIn || checkingOut}
            className={`px-5 py-3 rounded-full font-bold text-sm shadow-card-lg transition-all active:scale-95 disabled:opacity-60 ${getButtonStyle()}`}
          >
            {getButtonLabel()}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-24 space-y-6">
        {/* Status Card */}
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full ${sc.icon} flex items-center justify-center`}>
            <Clock className={`w-5 h-5 ${sc.iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Today's Status</p>
            <p className={`text-sm font-bold ${sc.textColor}`}>{sc.text}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: NotebookPen, label: "Diary", path: "/diary", color: "bg-accent/10 text-accent" },
              { icon: FileText, label: "Circulars", path: "/circulars", color: "bg-primary/10 text-primary" },
              { icon: CalendarDays, label: "Timetable", path: "/timetable", color: "bg-success/10 text-success" },
              { icon: ClipboardList, label: "Homework", path: "/homework", color: "bg-accent/10 text-accent" },
              { icon: Image, label: "Events", path: "/events", color: "bg-success/10 text-success" },
              { icon: MapPinOff, label: "Remote", path: "/remote-login", color: "bg-destructive/10 text-destructive" },
              { icon: ShieldCheck, label: "Approvals", path: "/approvals", color: "bg-primary/10 text-primary" },
              { icon: Settings, label: "Settings", path: "/settings", color: "bg-muted-foreground/10 text-muted-foreground" },
            ].map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-1.5 py-3 bg-card rounded-xl shadow-card active:scale-95 transition-transform">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-foreground">{action.label}</span>
              </button>
            ))}
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

      {/* Check-out Confirmation Dialog */}
      <AlertDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-out</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">Are you sure you want to check out?</span>
              <span className="block text-foreground font-semibold text-base">Current time: {checkoutTime}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckOutConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Check Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardScreen;
