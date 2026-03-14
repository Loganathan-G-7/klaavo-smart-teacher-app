import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, FileText, Upload, Clock, LogIn, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parse, differenceInSeconds } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const leaveBalance = [
  { type: "CL", label: "Casual", used: 4, total: 12, color: "text-accent bg-accent/10" },
  { type: "ML", label: "Medical", used: 0, total: 10, color: "text-success bg-success/10" },
  { type: "EL", label: "Earned", used: 0, total: 15, color: "text-primary bg-primary/10" },
  { type: "EM", label: "Emergency", used: 0, total: 3, color: "text-destructive bg-destructive/10" },
];

const leavesData = [
  { id: 1, type: "Casual Leave", from: "10 Mar 2026", to: "11 Mar 2026", reason: "Family function", status: "pending" },
  { id: 2, type: "Medical Leave", from: "25 Feb 2026", to: "26 Feb 2026", reason: "Doctor appointment", status: "approved" },
  { id: 3, type: "Casual Leave", from: "14 Feb 2026", to: "14 Feb 2026", reason: "Personal work", status: "approved" },
  { id: 4, type: "Emergency Leave", from: "5 Feb 2026", to: "5 Feb 2026", reason: "Family emergency", status: "rejected" },
  { id: 5, type: "Casual Leave", from: "20 Jan 2026", to: "21 Jan 2026", reason: "Travel", status: "approved" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") });
  }
  return options;
};

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
  return `${h}h ${m}m`;
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

  // Attendance state
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const monthOptions = useMemo(() => getMonthOptions(), []);

  const teacherId = localStorage.getItem("teacher_id") || "";

  useEffect(() => {
    if (!teacherId || mainTab !== "attendance") return;
    const fetchAttendance = async () => {
      setLoading(true);
      const monthDate = parse(selectedMonth, "yyyy-MM", new Date());
      const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
      const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("teacher_id", teacherId)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true })
        .order("created_at", { ascending: true });

      if (!error && data) {
        setAttendanceRecords(data as AttendanceRecord[]);
      }
      setLoading(false);
    };
    fetchAttendance();
  }, [teacherId, selectedMonth, mainTab]);

  // Group records by date
  const recordsByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord[]> = {};
    for (const r of attendanceRecords) {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    }
    return map;
  }, [attendanceRecords]);

  // Days of selected month
  const daysInMonth = useMemo(() => {
    const monthDate = parse(selectedMonth, "yyyy-MM", new Date());
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const today = new Date();
    const endDate = end > today ? today : end;
    if (start > today) return [];
    return eachDayOfInterval({ start, end: endDate });
  }, [selectedMonth]);

  // Summary
  const summary = useMemo(() => {
    let present = 0, absent = 0, late = 0, totalSeconds = 0;
    for (const day of daysInMonth) {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayOfWeek = day.getDay();
      if (dayOfWeek === 0) continue; // Skip Sundays
      const recs = recordsByDate[dateStr];
      if (!recs || recs.length === 0) {
        absent++;
        continue;
      }
      const secs = calcDaySeconds(recs);
      totalSeconds += secs;
      // Check first check-in time for late
      const firstCheckIn = recs[0]?.check_in;
      if (firstCheckIn) {
        const parts = firstCheckIn.split(":").map(Number);
        const totalMin = parts[0] * 60 + parts[1];
        if (totalMin > 540) { // After 9:00 AM
          late++;
        }
      }
      if (secs >= 28800) { // 8 hours
        present++;
      } else {
        // Check if still checked in (last record has no check_out)
        const lastRec = recs[recs.length - 1];
        if (!lastRec.check_out && format(new Date(), "yyyy-MM-dd") === dateStr) {
          present++; // In progress today, count as present for now
        } else {
          absent++;
        }
      }
    }
    return { present, absent, late, totalSeconds };
  }, [daysInMonth, recordsByDate]);

  const filteredLeaves = leavesData.filter((l) => l.status === leaveTab);

  const handleSubmit = () => {
    if (!leaveType || !fromDate || !toDate || !reason.trim()) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Leave Applied", description: "Your leave request has been submitted." });
    setDialogOpen(false);
    setLeaveType("");
    setFromDate(undefined);
    setToDate(undefined);
    setReason("");
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
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
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
                            <Calendar className="w-4 h-4" />
                            {fromDate ? format(fromDate, "dd MMM") : "Select"}
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
                            <Calendar className="w-4 h-4" />
                            {toDate ? format(toDate, "dd MMM") : "Select"}
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
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for leave..."
                      rows={3}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                  <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98]">
                    Submit Leave Request
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Top-level tabs */}
        <div className="flex gap-2">
          {["attendance", "leave"].map((t) => (
            <button
              key={t}
              onClick={() => setMainTab(t)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                mainTab === t
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary-foreground/10 text-primary-foreground/70"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-5 pb-8">
        {mainTab === "attendance" ? (
          <div className="space-y-4">
            {/* Month filter */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-card rounded-xl p-3 shadow-card text-center">
                <div className="w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center text-success bg-success/10">
                  <span className="text-base font-bold">{summary.present}</span>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">Present</p>
              </div>
              <div className="bg-card rounded-xl p-3 shadow-card text-center">
                <div className="w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center text-destructive bg-destructive/10">
                  <span className="text-base font-bold">{summary.absent}</span>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">Absent</p>
              </div>
              <div className="bg-card rounded-xl p-3 shadow-card text-center">
                <div className="w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center text-amber-500 bg-amber-500/10">
                  <span className="text-base font-bold">{summary.late}</span>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">Late</p>
              </div>
              <div className="bg-card rounded-xl p-3 shadow-card text-center">
                <div className="w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center text-primary bg-primary/10">
                  <span className="text-[11px] font-bold">{formatHoursMin(summary.totalSeconds)}</span>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">Hours</p>
              </div>
            </div>

            {/* Day-wise list */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
            ) : (
              <div className="space-y-2">
                {daysInMonth.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayOfWeek = day.getDay();
                  const isSunday = dayOfWeek === 0;
                  const recs = recordsByDate[dateStr];
                  const hasRecords = recs && recs.length > 0;
                  const daySec = hasRecords ? calcDaySeconds(recs) : 0;
                  const firstCheckIn = hasRecords ? recs[0].check_in : null;
                  const lastRec = hasRecords ? recs[recs.length - 1] : null;
                  const lastCheckOut = lastRec?.check_out || null;
                  const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;
                  const stillCheckedIn = hasRecords && !lastRec?.check_out;

                  let statusLabel = "Absent";
                  let statusClass = "bg-destructive/15 text-destructive";
                  if (isSunday) {
                    statusLabel = "Holiday";
                    statusClass = "bg-muted text-muted-foreground";
                  } else if (hasRecords) {
                    if (daySec >= 28800) {
                      statusLabel = "Present";
                      statusClass = "bg-success/15 text-success";
                    } else if (stillCheckedIn && isToday) {
                      statusLabel = "In Progress";
                      statusClass = "bg-primary/15 text-primary";
                    } else {
                      statusLabel = "Absent";
                      statusClass = "bg-destructive/15 text-destructive";
                    }
                  }

                  return (
                    <div key={dateStr} className="bg-card rounded-xl p-3.5 shadow-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[40px]">
                            <p className="text-lg font-bold text-foreground leading-none">{format(day, "dd")}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{dayNames[dayOfWeek]}</p>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <LogIn className="w-3 h-3 text-success" />
                              <span className="text-xs text-success font-medium">{formatTime12(firstCheckIn)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <LogOut className="w-3 h-3 text-destructive" />
                              <span className="text-xs text-destructive font-medium">{formatTime12(lastCheckOut)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={cn("text-[10px] px-2 py-0.5", statusClass)}>
                            {statusLabel}
                          </Badge>
                          {hasRecords && (
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {formatHoursMin(daySec)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }).reverse()}
              </div>
            )}
          </div>
        ) : (
          /* Leave Tab */
          <div>
            {/* Leave Balance */}
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
                  <TabsTrigger key={t} value={t} className="flex-1 text-xs font-semibold capitalize rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {t}
                  </TabsTrigger>
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
                          <Badge className={cn("text-[10px] px-2 py-0.5 capitalize", statusColors[leave.status])}>
                            {leave.status}
                          </Badge>
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
    </div>
  );
};

export default LeaveScreen;
