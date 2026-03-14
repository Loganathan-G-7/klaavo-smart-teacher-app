import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CheckCircle2, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const pad = (n: number) => String(n).padStart(2, "0");

const formatTimer = (seconds: number) => {
  const h = pad(Math.floor(seconds / 3600));
  const m = pad(Math.floor((seconds % 3600) / 60));
  const s = pad(seconds % 60);
  return `${h}:${m}:${s}`;
};

interface AttendanceRow {
  id: string;
  check_in: string | null;
  check_out: string | null;
}

const parseTime = (timeStr: string): Date => {
  const [h, m, s] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, s || 0, 0);
  return d;
};

const calcCompletedSeconds = (rows: AttendanceRow[]): number => {
  let total = 0;
  for (const row of rows) {
    if (row.check_in && row.check_out) {
      const ci = parseTime(row.check_in);
      const co = parseTime(row.check_out);
      total += Math.max(0, Math.floor((co.getTime() - ci.getTime()) / 1000));
    }
  }
  return total;
};

type Status = "absent" | "in_progress" | "present";

const CheckInScreen = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [completedSeconds, setCompletedSeconds] = useState(0);
  const [currentSessionElapsed, setCurrentSessionElapsed] = useState(0);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutTime, setCheckoutTime] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const now = new Date();
  const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const totalElapsed = completedSeconds + currentSessionElapsed;

  const getStatus = (): Status => {
    if (totalElapsed >= 28800) return "present";
    if (checkedIn) return "in_progress";
    return "absent";
  };

  useEffect(() => {
    const loadToday = async () => {
      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) return;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("date", today)
        .order("created_at", { ascending: true });

      if (!data || data.length === 0) return;

      const rows = data as AttendanceRow[];
      setCompletedSeconds(calcCompletedSeconds(rows));

      const openSession = rows.find((r) => r.check_in && !r.check_out);
      if (openSession) {
        setAttendanceId(openSession.id);
        const ci = parseTime(openSession.check_in!);
        setCheckInTime(ci);
        setCurrentSessionElapsed(Math.floor((Date.now() - ci.getTime()) / 1000));
        setCheckedIn(true);
      } else if (rows.length > 0) {
        setCheckedOut(true);
      }
    };
    loadToday();
  }, []);

  useEffect(() => {
    if (checkedIn) {
      intervalRef.current = setInterval(() => {
        setCurrentSessionElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkedIn]);

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

    setChecking(true);
    try {
      const position = await requestLocation();
      const { latitude, longitude } = position.coords;

      const checkNow = new Date();
      const today = checkNow.toISOString().split("T")[0];
      const currentTime = `${pad(checkNow.getHours())}:${pad(checkNow.getMinutes())}:${pad(checkNow.getSeconds())}`;

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
        toast.error("Check-in failed.");
        setChecking(false);
        return;
      }

      setAttendanceId(data?.id || null);
      setChecking(false);
      setCheckedIn(true);
      setCheckedOut(false);
      setCheckInTime(checkNow);
      setCurrentSessionElapsed(0);
      toast.success("Checked in successfully!");
    } catch (err: any) {
      setChecking(false);
      if (err.code === 1) {
        toast.error("Please enable location to check in");
      } else {
        toast.error("Could not get location. Please try again.");
      }
    }
  };

  const handleCheckOutRequest = () => {
    const n = new Date();
    setCheckoutTime(n.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    setShowCheckoutDialog(true);
  };

  const handleCheckOutConfirm = async () => {
    setShowCheckoutDialog(false);
    setCheckingOut(true);
    try {
      const position = await requestLocation();
      const { latitude, longitude } = position.coords;
      const n = new Date();
      const currentTime = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;

      if (attendanceId) {
        await supabase
          .from("attendance")
          .update({ check_out: currentTime, latitude, longitude } as any)
          .eq("id", attendanceId);
      }

      const sessionSecs = currentSessionElapsed;
      setCompletedSeconds((prev) => prev + sessionSecs);
      setCurrentSessionElapsed(0);
      setCheckedIn(false);
      setCheckedOut(true);
      setAttendanceId(null);
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

  const status = getStatus();
  const statusLabel = status === "present" ? "Present" : status === "in_progress" ? "In Progress" : "Absent";
  const statusColor = status === "present"
    ? "bg-success/15 text-success border-success/30 hover:bg-success/20"
    : status === "in_progress"
    ? "bg-blue-500/15 text-blue-500 border-blue-500/30 hover:bg-blue-500/20"
    : "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20";

  return (
    <div className="min-h-screen bg-card flex flex-col px-6 pt-6 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-8">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors ${checkedIn ? "bg-success/20" : checkedOut ? "bg-blue-500/20" : "bg-accent/20"}`}>
          {checkedIn ? <CheckCircle2 className="w-12 h-12 text-success" /> : checkedOut ? <Clock className="w-12 h-12 text-blue-500" /> : <MapPin className="w-12 h-12 text-accent" />}
        </div>

        <h2 className="text-lg font-bold text-foreground mb-1">
          {checkedIn ? "Currently Checked In" : checkedOut ? "Checked Out" : "School Campus"}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">Delhi Public School, Sector 24</p>

        {(checkedIn || checkedOut) && (
          <Badge className={`mb-6 text-sm px-4 py-1 ${statusColor}`}>
            {statusLabel}
          </Badge>
        )}

        <div className="bg-secondary rounded-xl px-8 py-5 mb-4 shadow-card text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">
            {checkedIn ? "Working Time" : checkedOut ? "Total Time Today" : "Current Time"}
          </p>
          <p className="text-4xl font-extrabold text-foreground tracking-tight font-mono">
            {checkedIn || checkedOut ? formatTimer(totalElapsed) : time}
          </p>
        </div>

        {checkedIn && checkInTime && (
          <p className="text-xs text-muted-foreground mb-6">
            Session started at {checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        )}

        <div className="flex items-center gap-2 mb-10">
          <Shield className="w-4 h-4 text-success" />
          <p className="text-sm font-medium text-success">You are within school premises</p>
        </div>

        {!checkedIn && (
          <button
            onClick={handleCheckIn}
            disabled={checking}
            className="w-full py-4 rounded-xl bg-success text-success-foreground font-bold text-base shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
          >
            {checking ? <span className="animate-pulse-gentle">Fetching Location...</span> : checkedOut ? "Check In Again" : "Check In"}
          </button>
        )}

        {checkedIn && (
          <button
            onClick={handleCheckOutRequest}
            disabled={checkingOut}
            className="w-full py-4 rounded-xl bg-destructive text-destructive-foreground font-bold text-base shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
          >
            {checkingOut ? <span className="animate-pulse-gentle">Fetching Location...</span> : "Check Out"}
          </button>
        )}

        {(checkedIn || checkedOut) && (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 mt-3 rounded-xl bg-secondary text-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Go to Dashboard
          </button>
        )}
      </div>

      <AlertDialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-out</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block">Check out at {checkoutTime}?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckOutConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CheckInScreen;
