import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, FileText, Upload } from "lucide-react";
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
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const leaveBalance = [
  { type: "CL", label: "Casual", used: 4, total: 12, color: "text-accent bg-accent/10" },
  { type: "ML", label: "Medical", used: 0, total: 10, color: "text-success bg-success/10" },
  { type: "EL", label: "Earned", used: 0, total: 15, color: "text-primary bg-primary/10" },
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

const LeaveScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [reason, setReason] = useState("");

  const filtered = leavesData.filter((l) => l.status === activeTab);

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
            <h1 className="text-primary-foreground text-xl font-bold">Leave</h1>
          </div>
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
                {/* Leave Type */}
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

                {/* Dates */}
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

                {/* Reason */}
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

                {/* Upload */}
                <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>

                {/* Submit */}
                <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98]">
                  Submit Leave Request
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Balance */}
        <div className="flex gap-3">
          {leaveBalance.map((lb) => (
            <div key={lb.type} className="flex-1 bg-primary-foreground/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-primary-foreground">{lb.total - lb.used}</p>
              <p className="text-[10px] text-primary-foreground/50 font-medium">{lb.used}/{lb.total} used</p>
              <p className="text-[10px] text-primary-foreground/70 font-semibold mt-0.5">{lb.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + List */}
      <div className="flex-1 px-5 pt-5 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-secondary rounded-xl h-10 p-1 mb-4">
            {["pending", "approved", "rejected"].map((t) => (
              <TabsTrigger key={t} value={t} className="flex-1 text-xs font-semibold capitalize rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {["pending", "approved", "rejected"].map((t) => (
            <TabsContent key={t} value={t} className="mt-0 space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No {t} leaves</p>
                </div>
              ) : (
                filtered.map((leave) => (
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
    </div>
  );
};

export default LeaveScreen;
