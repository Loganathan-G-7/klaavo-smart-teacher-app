import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const previousRequests = [
  { id: 1, date: "08 Mar 2026", location: "District Education Office", reason: "Official training program", duration: "Full Day", status: "approved" },
  { id: 2, date: "01 Mar 2026", location: "CBSE Regional Office", reason: "Paper evaluation duty", duration: "Half Day", status: "approved" },
  { id: 3, date: "22 Feb 2026", location: "Home - Medical Rest", reason: "Follow-up doctor visit", duration: "2 Hours", status: "rejected" },
  { id: 4, date: "15 Feb 2026", location: "University Campus", reason: "Workshop on NEP 2020", duration: "Full Day", status: "pending" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const RemoteLoginScreen = () => {
  const navigate = useNavigate();
  const [dutyDate, setDutyDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = () => {
    if (!dutyDate || !location.trim() || !reason.trim() || !duration) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Request Submitted", description: "Your remote login request has been sent for approval." });
    setDutyDate(undefined);
    setLocation("");
    setReason("");
    setDuration("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground text-xl font-bold">Remote Login Request</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-5 pb-8 space-y-5">
        {/* Info Card */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">You are outside school premises</p>
            <p className="text-xs text-muted-foreground mt-0.5">Current location: 12.9716° N, 77.5946° E</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Submit Request</h3>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Date of Duty *</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn("w-full flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm", !dutyDate && "text-muted-foreground")}>
                  <Calendar className="w-4 h-4" />
                  {dutyDate ? format(dutyDate, "dd MMM yyyy") : "Select date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={dutyDate} onSelect={setDutyDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Location of Duty *</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter duty location" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Reason *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for remote login..." rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Expected Duration *</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-hour">1 Hour</SelectItem>
                <SelectItem value="2-hours">2 Hours</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="full-day">Full Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Submit Request
          </button>
        </div>

        {/* Previous Requests */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Previous Requests</h3>
          <div className="space-y-3">
            {previousRequests.map((req) => (
              <div key={req.id} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-foreground">{req.date}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{req.location}
                    </p>
                  </div>
                  <Badge className={cn("text-[10px] px-2 py-0.5 capitalize border", statusColors[req.status])}>
                    {req.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{req.reason}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{req.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteLoginScreen;
