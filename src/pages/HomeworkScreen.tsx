import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, BookOpen, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const classList = ["LKG-A", "UKG-B", "Class 2-B", "Class 3-A", "Class 5-B"];
const subjectList = ["English", "Mathematics", "Science", "Hindi", "Art"];

const initialHomework = [
  { id: 1, subject: "English", description: "Write 5 sentences about your family", dueDate: "2026-03-12", className: "LKG-A", status: "assigned" as const },
  { id: 2, subject: "Mathematics", description: "Complete exercise 4.2, problems 1-15", dueDate: "2026-03-10", className: "Class 2-B", status: "due_today" as const },
  { id: 3, subject: "Science", description: "Draw and label the water cycle diagram", dueDate: "2026-03-08", className: "Class 5-B", status: "overdue" as const },
  { id: 4, subject: "Hindi", description: "Learn poem on page 45 for recitation", dueDate: "2026-03-14", className: "Class 3-A", status: "assigned" as const },
];

const statusConfig = {
  assigned: { label: "Assigned", color: "bg-accent/15 text-accent" },
  due_today: { label: "Due Today", color: "bg-destructive/10 text-destructive" },
  overdue: { label: "Overdue", color: "bg-destructive text-destructive-foreground" },
};

const HomeworkScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [homework, setHomework] = useState(initialHomework);
  const [form, setForm] = useState({ subject: "", description: "", dueDate: "", className: "", file: "" });

  const filtered = selectedClass === "all" ? homework : homework.filter((h) => h.className === selectedClass);

  const handleSubmit = () => {
    if (!form.subject || !form.description || !form.dueDate || !form.className) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setHomework((prev) => [
      { id: Date.now(), ...form, status: "assigned" as const },
      ...prev,
    ]);
    setForm({ subject: "", description: "", dueDate: "", className: "", file: "" });
    setShowAdd(false);
    toast({ title: "Homework assigned!", description: `${form.subject} homework added for ${form.className}` });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-primary px-6 pt-8 pb-5 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-lg font-bold text-primary-foreground">Homework</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedClass("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedClass === "all" ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 text-primary-foreground/70"
            }`}
          >
            All
          </button>
          {classList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedClass === c ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 text-primary-foreground/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pt-5 pb-8 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-semibold">No homework found</p>
            <p className="text-xs mt-1">Tap + to assign homework</p>
          </div>
        ) : (
          filtered.map((hw) => (
            <div key={hw.id} className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-foreground text-sm">{hw.subject}</p>
                  <p className="text-xs text-muted-foreground">{hw.className}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConfig[hw.status].color}`}>
                  {statusConfig[hw.status].label}
                </span>
              </div>
              <p className="text-xs text-foreground/80 mb-2">{hw.description}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Due: {new Date(hw.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          ))
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-[90vw] rounded-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Assign Homework</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Select value={form.className} onValueChange={(v) => setForm((p) => ({ ...p, className: v }))}>
              <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>{classList.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.subject} onValueChange={(v) => setForm((p) => ({ ...p, subject: v }))}>
              <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
              <SelectContent>{subjectList.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea
              placeholder="Homework description *"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
            />
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Upload className="w-4 h-4" />
              <span>Attach file (optional)</span>
            </button>
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-card-lg active:scale-[0.98] transition-transform"
            >
              Assign Homework
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeworkScreen;
