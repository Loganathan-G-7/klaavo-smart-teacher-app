import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, FileText, Upload, LogIn, LogOut, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parse, startOfWeek, endOfWeek, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const leaveBalance = [
  { type: "CL", label: "Casual", used: 4, total: 12 },
  { type: "ML", label: "Medical", used: 0, total: 10 },
  { type: "EL", label: "Earned", used: 0, total: 15 },
  { type: "EM", label: "Emergency", used: 0, total: 3 },
];

interface LeaveRow {
  id: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string | null;
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function formatHoursMin(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTime12(timeStr: string | null): string {
  if (!timeStr) return "-";
  const parts = timeStr.split(":");
  let h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

const LeaveScreen = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState("attendance");
  const [leaveTab, setLeaveTab] = useState("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "weekly">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const teacherId = localStorage.getItem("teacher_id") || "";

  const loadLeaves = async () => {
    if (!teacherId) return;
    setLeavesLoading(true);
    const { data, error } = await supabase
      .from("leave_requests")
      .select("id, leave_type, from_date, to_date, reason, status")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });
    if (!error && data) setLeaves(data as LeaveRow[]);
    setLeavesLoading(false);
  };

  useEffect(() => {
    if (mainTab === "leave") loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab, teacherId]);

  useEffect(() => {
    if (!teacherId || mainTab !== "attendance") return;
    const fetchAttendance = async () => {
      setLoading(true);
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("teacher_id", teacherId)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true });
      if (!error && data) setAttendanceRecords(data as AttendanceRecord[]);
      setLoading(false);
    };
    fetchAttendance();
  }, [teacherId, currentMonth, mainTab]);

  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const r of attendanceRecords) {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    }
    return map;
  }, [attendanceRecords]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  }, [currentMonth]);

  const summary = useMemo(() => {
    let present = 0, absent = 0, late = 0, totalSeconds = 0;
    const today = new Date();
    for (const day of daysInMonth) {
      if (day > today) continue;
      const dateStr = format(day, "yyyy-MM-dd");
      if (day.getDay() === 0) continue;
      const recs = recordsByDate[dateStr];
      if (!recs || recs.length === 0) { absent++; continue; }
      const secs = calcDaySeconds(recs);
      totalSeconds += secs;
      const firstCheckIn = recs[0]?.check_in;
      if (firstCheckIn) {
        const parts = firstCheckIn.split(":").map(Number);
        if (parts[0] * 60 + parts[1] > 540) late++;
      }
      const lastRec = recs[recs.length - 1];
      if (secs >= 28800 || (!lastRec.check_out && format(today, "yyyy-MM-dd") === dateStr)) {
        present++;
      } else {
        absent++;
      }
    }
    return { present, absent, late, totalSeconds };
  }, [daysInMonth, recordsByDate]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: endOfWeek(currentWeekStart, { weekStartsOn: 0 }),
    });
  }, [currentWeekStart]);

  const totalMonthHours = formatHoursMin(summary.totalSeconds);

  const filteredLeaves = leaves.filter((l) => l.status === leaveTab);

  const handleSubmit = async () => {
    if (!teacherId) {
      toast({ title: "Not signed in", description: "Please sign in again.", variant: "destructive" });
      return;
    }
    if (!leaveType || !fromDate || !toDate || !reason.trim()) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("leave_requests").insert({
      teacher_id: teacherId,
      leave_type: leaveType,
      from_date: format(fromDate, "yyyy-MM-dd"),
      to_date: format(toDate, "yyyy-MM-dd"),
      reason: reason.trim(),
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Leave Applied", description: "Your leave request has been submitted." });
    setDialogOpen(false);
    setLeaveType(""); setFromDate(undefined); setToDate(undefined); setReason("");
    loadLeaves();
  };

  const getDayStatus = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const today = new Date();
    const isSunday = day.getDay() === 0;
    const recs = recordsByDate[dateStr];
    if (isSunday) return { label: "WE", class: "text-amber-500" };
    if (day > today) return { label: "", class: "" };
    if (!recs || recs.length === 0) return { label: "A", class: "text-destructive" };
    const secs = calcDaySeconds(recs);
    const lastRec = recs[recs.length - 1];
    const checkInTime = recs[0]?.check_in;
    const timeLabel = checkInTime ? checkInTime.substring(0, 5) : "-";
    if (secs >= 28800 || (!lastRec.check_out && format(today, "yyyy-MM-dd") === dateStr)) {
      return { label: timeLabel, class: "text-green-500" };
    }
    return { label: "A", class: "text-destructive" };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-primary-foreground text-xl font-bold">
              {mainTab === "attendance" ? "Attendance" : "Leave"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {mainTab === "attendance" && (
              <button
                onClick={() => setViewMode(viewMode === "calendar" ? "weekly" : "calendar")}
                className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center"
              >
                {viewMode === "calendar" ? <List className="w-5 h-5 text-primary-foreground" /> : <LayoutGrid className="w-5 h-5 text-primary-foreground" />}
              </button>
            )}
            {mainTab === "leave" && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary-foreground" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-foreground">Apply Leave</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Leave Type</label>
                      <Select value={leaveType} onValueChange={setLeaveType}>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select leave type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">Casual Leave</SelectItem>
                          <SelectItem value="medical">Medical Leave</SelectItem>
                          <SelectItem value="emergency">Emergency Leave</SelectItem>
                          <SelectItem value="earned">Earned Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">From</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={cn("w-full flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm", !fromDate && "text-muted-foreground")}>
                              <Calendar className="w-4 h-4" />{fromDate ? format(fromDate, "dd MMM") : "Select"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">To</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={cn("w-full flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm", !toDate && "text-muted-foreground")}>
                              <Calendar className="w-4 h-4" />{toDate ? format(toDate, "dd MMM") : "Select"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Reason *</label>
                      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for leave..." rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm text-muted-foreground">
                      <Upload className="w-4 h-4" />Upload Document
                    </button>
                    <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm">Submit Leave Request</button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {["attendance", "leave"].map((t) => (
            <button key={t} onClick={() => setMainTab(t)} className={cn("flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all", mainTab === t ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 text-primary-foreground/70")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 pb-8">
        {mainTab === "attendance" ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Present", value: summary.present, color: "text-green-500 bg-green-500/10" },
                { label: "Absent", value: summary.absent, color: "text-destructive bg-destructive/10" },
                { label: "Late", value: summary.late, color: "text-amber-500 bg-amber-500/10" },
                { label: "Hours", value: totalMonthHours, color: "text-primary bg-primary/10" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-3 shadow-card text-center">
                  <div className={cn("w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold", s.color)}>{s.value}</div>
                  <p className="text-[10px] font-medium text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {viewMode === "calendar" ? (
              /* Calendar View */
              <div className="bg-card rounded-2xl p-4 shadow-card">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-foreground">{format(currentMonth, "MMMM yyyy")}</span>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {dayNames.map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for first day offset */}
                  {Array.from({ length: daysInMonth[0]?.getDay() || 0 }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {daysInMonth.map((day) => {
                    const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    const status = getDayStatus(day);
                    return (
                      <div key={format(day, "yyyy-MM-dd")} className={cn("aspect-square rounded-xl flex flex-col items-center justify-center", isToday ? "bg-primary" : "bg-secondary/50")}>
                        <span className={cn("text-xs font-bold", isToday ? "text-primary-foreground" : "text-foreground")}>{format(day, "d")}</span>
                        <span className={cn("text-[8px] font-medium", isToday ? "text-primary-foreground/80" : status.class)}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Weekly List View */
              <div className="space-y-3">
                {/* Week Navigation */}
                <div className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card">
                  <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-foreground">
                    {format(currentWeekStart, "dd MMM")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), "dd MMM yyyy")}
                  </span>
                  <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {weekDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isSunday = day.getDay() === 0;
                  const recs = recordsByDate[dateStr];
                  const firstCheckIn = recs?.[0]?.check_in || null;
                  const lastCheckOut = recs?.[recs.length - 1]?.check_out || null;
                  const daySec = recs ? calcDaySeconds(recs) : 0;

                  return (
                    <div key={dateStr} className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
                      <div className="min-w-[44px] bg-secondary rounded-xl p-2 text-center">
                        <p className="text-base font-extrabold text-foreground leading-none">{format(day, "dd")}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{dayNames[day.getDay()]}</p>
                      </div>
                      {isSunday ? (
                        <span className="text-amber-500 font-bold text-sm">Weekend</span>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs text-green-500 font-medium">{formatTime12(firstCheckIn)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-destructive" />
                            <span className="text-xs text-destructive font-medium">{formatTime12(lastCheckOut)}</span>
                          </div>
                        </div>
                      )}
                      {!isSunday && daySec > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{formatHoursMin(daySec)}</p>
                          <p className="text-[10px] text-muted-foreground">Hrs</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Leave Tab */
          <div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {leaveBalance.map((lb) => (
                <div key={lb.type} className="bg-card rounded-xl p-3 shadow-card text-center">
                  <p className="text-xl font-extrabold text-primary">{lb.total - lb.used}</p>
                  <p className="text-[10px] text-muted-foreground">{lb.used}/{lb.total}</p>
                  <p className="text-[10px] font-semibold text-foreground mt-0.5">{lb.label}</p>
                </div>
              ))}
            </div>
            <Tabs value={leaveTab} onValueChange={setLeaveTab}>
              <TabsList className="w-full bg-secondary rounded-xl h-10 p-1 mb-4">
                {["pending", "approved", "rejected"].map((t) => (
                  <TabsTrigger key={t} value={t} className="flex-1 text-xs font-semibold capitalize rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t}</TabsTrigger>
                ))}
              </TabsList>
              {["pending", "approved", "rejected"].map((t) => (
                <TabsContent key={t} value={t} className="mt-0 space-y-3">
                  {filteredLeaves.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No {t} leaves</p>
                    </div>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <div key={leave.id} className="bg-card rounded-xl p-4 shadow-card">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-bold text-foreground text-sm">{leave.type}</p>
                          <Badge className={cn("text-[10px] px-2 py-0.5 capitalize", statusColors[leave.status])}>{leave.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{leave.from} — {leave.to}</p>
                        <p className="text-xs text-muted-foreground/70">{leave.reason}</p>
                      </div>
                    ))
                  )}
                </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  };
  
  export default LeaveScreen;