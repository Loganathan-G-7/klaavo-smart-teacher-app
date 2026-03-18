import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  LogIn,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, parse } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
}

function calcDaySeconds(records: AttendanceRecord[]): number {
  let total = 0;
  for (const r of records) {
    if (r.check_in && r.check_out) {
      const cin = r.check_in.split(":").map(Number);
      const cout = r.check_out.split(":").map(Number);
      const inSec = cin[0] * 3600 + cin[1] * 60 + (cin[2] || 0);
      const outSec = cout[0] * 3600 + cout[1] * 60 + (cout[2] || 0);
      if (outSec > inSec) total += outSec - inSec;
    }
  }
  return total;
}

function formatHHMM(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatTime24Short(timeStr: string | null): string {
  if (!timeStr) return "--:--";
  const parts = timeStr.split(":");
  return `${parts[0]}:${parts[1]}`;
}

function formatTime12(timeStr: string | null): string {
  if (!timeStr) return "--:-- --";
  const parts = timeStr.split(":");
  let h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, "0")}:${m} ${ampm}`;
}

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const TeacherAttendanceScreen = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"monthly" | "weekly">("monthly");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const teacherId = localStorage.getItem("teacher_id") || "";

  // Fetch data based on view
  useEffect(() => {
    if (!teacherId) return;
    const fetch = async () => {
      setLoading(true);
      let start: string, end: string;
      if (view === "monthly") {
        start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
        end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      } else {
        start = format(currentWeekStart, "yyyy-MM-dd");
        end = format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), "yyyy-MM-dd");
      }
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("teacher_id", teacherId)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true })
        .order("created_at", { ascending: true });
      if (!error && data) setRecords(data as AttendanceRecord[]);
      setLoading(false);
    };
    fetch();
  }, [teacherId, view, currentMonth, currentWeekStart]);

  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const r of records) {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    }
    return map;
  }, [records]);

  // Total hours for displayed period
  const totalPeriodSeconds = useMemo(() => {
    let total = 0;
    for (const dateRecs of Object.values(recordsByDate)) {
      total += calcDaySeconds(dateRecs);
    }
    return total;
  }, [recordsByDate]);

  // Calendar grid for monthly view
  const calendarGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = monthStart.getDay(); // 0=Sun
    return { days, startPadding };
  }, [currentMonth]);

  // Week days for weekly view
  const weekDays = useMemo(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  }, [currentWeekStart]);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const handleCheckIn = async () => {
    if (!teacherId) {
      toast({ title: "Error", description: "Teacher not found.", variant: "destructive" });
      return;
    }
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation not supported.", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const now = new Date();
        const timeStr = format(now, "HH:mm:ss");
        const { error } = await supabase.from("attendance").insert({
          teacher_id: teacherId,
          date: format(now, "yyyy-MM-dd"),
          check_in: timeStr,
          status: "present",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (error) {
          toast({ title: "Error", description: "Failed to check in.", variant: "destructive" });
        } else {
          toast({ title: "Checked In", description: `Checked in at ${format(now, "hh:mm a")}` });
          // Refresh
          setRecords((prev) => [...prev]);
          // Re-fetch
          const start = view === "monthly"
            ? format(startOfMonth(currentMonth), "yyyy-MM-dd")
            : format(currentWeekStart, "yyyy-MM-dd");
          const end = view === "monthly"
            ? format(endOfMonth(currentMonth), "yyyy-MM-dd")
            : format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), "yyyy-MM-dd");
          const { data } = await supabase
            .from("attendance")
            .select("*")
            .eq("teacher_id", teacherId)
            .gte("date", start)
            .lte("date", end)
            .order("date", { ascending: true })
            .order("created_at", { ascending: true });
          if (data) setRecords(data as AttendanceRecord[]);
        }
      },
      () => {
        toast({ title: "Location Required", description: "Please enable location to check in.", variant: "destructive" });
      }
    );
  };

  const isWeekend = (day: Date) => day.getDay() === 0 || day.getDay() === 6;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: "#1A1A1A" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#2A2A2A" }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
            T
          </div>
          <h1 className="text-white text-lg font-bold">Attendance</h1>
        </div>
        <button
          onClick={() => setView(view === "monthly" ? "weekly" : "monthly")}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "#2A2A2A" }}
        >
          {view === "monthly" ? (
            <List className="w-5 h-5 text-white" />
          ) : (
            <CalendarIcon className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Month/Week Navigation */}
      <div className="px-5 pb-3 flex items-center justify-between">
        <button
          onClick={() =>
            view === "monthly"
              ? setCurrentMonth(subMonths(currentMonth, 1))
              : setCurrentWeekStart(subWeeks(currentWeekStart, 1))
          }
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "#2A2A2A" }}
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <span className="text-white font-semibold text-sm">
          {view === "monthly"
            ? format(currentMonth, "MMMM yyyy")
            : `${format(currentWeekStart, "dd-MMM-yyyy")} - ${format(
                endOfWeek(currentWeekStart, { weekStartsOn: 0 }),
                "dd-MMM-yyyy"
              )}`}
        </span>
        <button
          onClick={() =>
            view === "monthly"
              ? setCurrentMonth(addMonths(currentMonth, 1))
              : setCurrentWeekStart(addWeeks(currentWeekStart, 1))
          }
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "#2A2A2A" }}
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : view === "monthly" ? (
          /* ============ MONTHLY CALENDAR VIEW ============ */
          <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Padding for start of month */}
              {Array.from({ length: calendarGrid.startPadding }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {calendarGrid.days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const isToday = dateStr === todayStr;
                const weekend = isWeekend(day);
                const recs = recordsByDate[dateStr];
                const hasData = recs && recs.length > 0;
                const firstCheckIn = hasData ? recs[0].check_in : null;
                const checkInShort = firstCheckIn
                  ? formatTime24Short(firstCheckIn)
                  : weekend
                  ? "00:00"
                  : "--:--";

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "rounded-xl p-1.5 flex flex-col items-center justify-center min-h-[56px] relative",
                      isToday && "ring-2 ring-blue-500"
                    )}
                    style={{ background: "#2A2A2A" }}
                  >
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isToday ? "text-blue-400" : "text-white"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-semibold mt-0.5",
                        weekend
                          ? "text-amber-400"
                          : hasData
                          ? "text-green-400"
                          : "text-gray-500"
                      )}
                    >
                      {checkInShort}
                    </span>
                    {weekend && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-amber-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ============ WEEKLY LIST VIEW ============ */
          <div className="space-y-2">
            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const weekend = isWeekend(day);
              const recs = recordsByDate[dateStr];
              const hasData = recs && recs.length > 0;
              const daySec = hasData ? calcDaySeconds(recs) : 0;
              const firstCheckIn = hasData ? recs[0].check_in : null;
              const lastRec = hasData ? recs[recs.length - 1] : null;
              const lastCheckOut = lastRec?.check_out || null;
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className={cn("rounded-xl p-3.5 flex items-center gap-3", isToday && "ring-2 ring-blue-500")}
                  style={{ background: "#2A2A2A" }}
                >
                  {/* Date box */}
                  <div
                    className="rounded-lg px-3 py-2 text-center min-w-[48px]"
                    style={{ background: "#1A1A1A" }}
                  >
                    <p className="text-lg font-bold text-white leading-none">
                      {format(day, "d")}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                      {DAY_LABELS[day.getDay()]}
                    </p>
                  </div>

                  {weekend ? (
                    <div className="flex-1">
                      <span className="text-amber-400 text-sm font-semibold">Weekend</span>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        <span className="text-xs text-green-400 font-medium">
                          {formatTime12(firstCheckIn)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                        <span className="text-xs text-red-400 font-medium">
                          {formatTime12(lastCheckOut)}
                        </span>
                      </div>
                    </div>
                  )}

                  {!weekend && (
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">
                        {formatHHMM(daySec)} <span className="text-gray-400 text-xs font-normal">Hrs</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: "#2A2A2A" }}
      >
        <button
          onClick={handleCheckIn}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-bold text-sm active:scale-95 transition-transform"
        >
          <LogIn className="w-4 h-4" />
          Check-in
        </button>
        <div className="text-right">
          <p className="text-gray-400 text-[10px] font-medium">Total Hours</p>
          <p className="text-white font-bold text-lg leading-none">
            {formatHHMM(totalPeriodSeconds)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendanceScreen;
