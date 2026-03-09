import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CheckCircle2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formatTimer = (seconds: number) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
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
    if (done) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [done]);

  const handleCheckIn = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setDone(true);
      setCheckInTime(new Date());
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-card flex flex-col px-6 pt-6 pb-8 max-w-md mx-auto">
      {/* Back */}
      <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-8">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Location Pin */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors ${
          done ? "bg-success/20" : "bg-accent/20"
        }`}>
          {done ? (
            <CheckCircle2 className="w-12 h-12 text-success" />
          ) : (
            <MapPin className="w-12 h-12 text-accent" />
          )}
        </div>

        <h2 className="text-lg font-bold text-foreground mb-1">
          {done ? "Checked In Successfully!" : "School Campus"}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">Delhi Public School, Sector 24</p>

        {/* Status Badge */}
        {done && (
          <Badge className={`mb-6 text-sm px-4 py-1 ${
            isLate
              ? "bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20"
              : "bg-success/15 text-success border-success/30 hover:bg-success/20"
          }`}>
            {isLate ? "Late" : "Present"}
          </Badge>
        )}

        {/* Timer */}
        {done ? (
          <div className="bg-secondary rounded-xl px-8 py-5 mb-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground font-medium mb-1">Duration</p>
            <p className="text-4xl font-extrabold text-foreground tracking-tight font-mono">
              {formatTimer(elapsed)}
            </p>
          </div>
        ) : (
          <div className="bg-secondary rounded-xl px-8 py-4 mb-8 shadow-card">
            <p className="text-xs text-muted-foreground text-center font-medium">Current Time</p>
            <p className="text-3xl font-extrabold text-foreground text-center tracking-tight">{time}</p>
          </div>
        )}

        {/* Check-in time */}
        {done && checkInTime && (
          <p className="text-xs text-muted-foreground mb-6">
            Checked in at {checkInTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        )}

        {/* GPS Status */}
        <div className="flex items-center gap-2 mb-10">
          <Shield className="w-4 h-4 text-success" />
          <p className="text-sm font-medium text-success">You are within school premises</p>
        </div>

        {/* Check In Button */}
        {!done && (
          <button
            onClick={handleCheckIn}
            disabled={checking}
            className="w-full py-4 rounded-xl bg-success text-success-foreground font-bold text-base shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
          >
            {checking ? (
              <span className="animate-pulse-gentle">Verifying Location...</span>
            ) : (
              "Check In"
            )}
          </button>
        )}

        {/* Back to Dashboard */}
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
