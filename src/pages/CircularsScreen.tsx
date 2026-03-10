import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const circularsData = [
  { id: 1, title: "Annual Day Celebration Schedule", date: "10 Mar 2026", priority: "urgent", read: false, content: "All staff members are requested to attend the Annual Day planning meeting on 12th March at 3:00 PM in the auditorium. Please bring your class-wise performance list.", attachment: "annual_day_schedule.pdf" },
  { id: 2, title: "Revised Exam Timetable - March 2026", date: "09 Mar 2026", priority: "urgent", read: false, content: "Due to the holiday on 15th March, the exam timetable has been revised. Please check the updated schedule and prepare accordingly.", attachment: "exam_timetable_march.pdf" },
  { id: 3, title: "Staff Meeting - Monthly Review", date: "08 Mar 2026", priority: "normal", read: true, content: "Monthly staff meeting will be held on 10th March at 4:00 PM. Agenda includes curriculum review and upcoming events discussion." },
  { id: 4, title: "Sports Day Duty Allocation", date: "07 Mar 2026", priority: "normal", read: true, content: "Sports Day will be held on 20th March. All teachers are assigned specific duties. Please check the duty roster attached." },
  { id: 5, title: "Fee Collection Reminder", date: "06 Mar 2026", priority: "normal", read: false, content: "Kindly remind parents about pending fee payments for Term 2. Last date for payment without fine is 15th March." },
  { id: 6, title: "Emergency Evacuation Drill Notice", date: "05 Mar 2026", priority: "urgent", read: true, content: "An emergency evacuation drill will be conducted on 11th March at 11:00 AM. All teachers must guide students to the designated assembly points." },
];

const CircularsScreen = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [circulars, setCirculars] = useState(circularsData);
  const [selected, setSelected] = useState<typeof circularsData[0] | null>(null);

  const filtered = circulars.filter((c) => {
    if (filter === "unread") return !c.read;
    if (filter === "urgent") return c.priority === "urgent";
    return true;
  });

  const markAllRead = () => {
    setCirculars(circulars.map((c) => ({ ...c, read: true })));
  };

  const markRead = (id: number) => {
    setCirculars(circulars.map((c) => c.id === id ? { ...c, read: true } : c));
  };

  const openCircular = (c: typeof circularsData[0]) => {
    markRead(c.id);
    setSelected(c);
  };

  const unreadCount = circulars.filter((c) => !c.read).length;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-primary-foreground text-xl font-bold">Circulars</h1>
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>
          <button onClick={markAllRead} className="text-xs font-semibold text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 pt-5">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full bg-secondary rounded-xl h-10 p-1 mb-4">
            {[{ value: "all", label: "All" }, { value: "unread", label: "Unread" }, { value: "urgent", label: "Urgent" }].map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="flex-1 text-xs font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <div className="flex-1 px-5 pb-8 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 text-success/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          filtered.map((c) => (
            <button key={c.id} onClick={() => openCircular(c)} className="w-full text-left bg-card rounded-xl p-4 shadow-card flex gap-3 items-start transition-all active:scale-[0.98]">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", c.priority === "urgent" ? "bg-destructive/10" : "bg-accent/10")}>
                {c.priority === "urgent" ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <FileText className="w-5 h-5 text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-bold text-foreground line-clamp-1", !c.read && "text-foreground")}>{c.title}</p>
                  {!c.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.date}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge className={cn("text-[9px] px-2 py-0 border", c.priority === "urgent" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-accent/10 text-accent border-accent/20")}>
                    {c.priority === "urgent" ? "Urgent" : "Normal"}
                  </Badge>
                  {c.attachment && <span className="text-[9px] text-muted-foreground">📎 Attachment</span>}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground pr-6">{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <div className="flex items-center gap-2">
              <Badge className={cn("text-[10px] px-2 py-0.5 border", selected?.priority === "urgent" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-accent/10 text-accent border-accent/20")}>
                {selected?.priority === "urgent" ? "Urgent" : "Normal"}
              </Badge>
              <span className="text-xs text-muted-foreground">{selected?.date}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{selected?.content}</p>
            {selected?.attachment && (
              <button className="w-full flex items-center gap-2 rounded-xl border border-border p-3 text-sm text-muted-foreground hover:bg-secondary transition-colors">
                <Eye className="w-4 h-4" />
                View Attachment: {selected.attachment}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CircularsScreen;
