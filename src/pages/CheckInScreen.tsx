import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CheckCircle2, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const pad = (n: number) => String(n).padStart(2, "0");

const formatTimer = (seconds: number) => {
  const h = pad(Math.floor(seconds / 3600));
  const m = pad(Math.floor((seconds % 3600) / 60));
  const s = pad(seconds % 60);
  return `${h}:${m}:${s}`;
};

const CheckInScreen = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const now = new Date();
  const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const isLate = checkInTime ? checkInTime.getHours() >= 8 : false;

  useEffect(() => {
    const checkExisting = async () => {
      const teacherId = localStorage.getItem("teacher_id");
      if (!teacherId) return;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("date", today)
        .maybeSingle();

      if (data?.check_in && !data?.check_out) {
        setDone(true);
        const [h, m, s] = data.check_in.split(":").map(Number);
        const ci = new Date();
        ci.setHours(h, m, s || 0, 0);
        setCheckInTime(ci);
        setElapsed(Math.floor((Date.now() - ci.getTime()) / 1000));
      }
    };
    checkExisting();
  }, []);

  useEffect(() => {
    if (done) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [done]);

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

      const { error } = await supabase.from("attendance").insert({
        teacher_id: teacherId,
        date: today,
        check_in: currentTime,
        status: "present",
        latitude,
        longitude,
      } as any);

      if (error) {
        console.error("Check-in error:", error);
        toast.error("Check-in failed. You may have already checked in today.");
        setChecking(false);
        return;
      }

      setChecking(false);
      setDone(true);
      setCheckInTime(checkNow);
      setElapsed(0);
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

  return (
    <div className="min-h-screen bg-card flex flex-col px-6 pt-6 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-8">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors ${done ? "bg-success/20" : "bg-accent/20"}`}>
          {done ? <CheckCircle2 className="w-12 h-12 text-success" /> : <MapPin className="w-12 h-12 text-accent" />}
        </div>

        <h2 className="text-lg font-bold text-foreground mb-1">
          {done ? "Checked In Successfully!" : "School Campus"}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">Delhi Public School, Sector 24</p>

        {done && (
          <Badge className={`mb-6 text-sm px-4 py-1 ${
            isLate ? "bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20" : "bg-success/15 text-success border-success/30 hover:bg-success/20"
          }`}>
            {isLate ? "Late" : "Present"}
          </Badge>
        )}

        {done ? (
          <div className="bg-secondary rounded-xl px-8 py-5 mb-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground font-medium mb-1">Duration</p>
            <p className="text-4xl font-extrabold text-foreground tracking-tight font-mono">{formatTimer(elapsed)}</p>
          </div>
        ) : (
          <div className="bg-secondary rounded-xl px-8 py-4 mb-8 shadow-card">
            <p className="text-xs text-muted-foreground text-center font-medium">Current Time</p>
            <p className="text-3xl font-extrabold text-foreground text-center tracking-tight">{time}</p>
          </div>
        )}

        {done && checkInTime && (
          <p className="text-xs text-muted-foreground mb-6">
            Checked in at {checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        )}

        <div className="flex items-center gap-2 mb-10">
          <Shield className="w-4 h-4 text-success" />
          <p className="text-sm font-medium text-success">You are within school premises</p>
        </div>

        {!done && (
          <button
            onClick={handleCheckIn}
            disabled={checking}
            className="w-full py-4 rounded-xl bg-success text-success-foreground font-bold text-base shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
          >
            {checking ? <span className="animate-pulse-gentle">Fetching Location...</span> : "Check In"}
          </button>
        )}

        {done && (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckInScreen;
