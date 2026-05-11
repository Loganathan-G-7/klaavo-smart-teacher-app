import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, Trash2, Languages } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ClassRow {
  id: string;
  name: string;
  section: string;
}

interface DiaryEntry {
  id: string;
  date: string;
  class_id: string | null;
  notes: string | null;
  subject: string | null;
}

const DailyDiaryScreen = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState("");
  const [diaryText, setDiaryText] = useState("");
  const [language, setLanguage] = useState<"English" | "Tamil">("English");
  const [sections, setSections] = useState<string[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const maxChars = 1000;

  const teacherId = localStorage.getItem("teacher_id") || "";

  const loadEntries = async () => {
    if (!teacherId) return;
    const { data } = await supabase
      .from("diary")
      .select("id, date, class_id, notes, subject")
      .eq("teacher_id", teacherId)
      .order("date", { ascending: false })
      .limit(20);
    setEntries((data || []) as DiaryEntry[]);
  };

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data: tc } = await supabase
        .from("teacher_classes")
        .select("class_id, classes(id, name, section)")
        .eq("teacher_id", teacherId);
      const cls: ClassRow[] = (tc || [])
        .map((row: any) => row.classes)
        .filter(Boolean);
      setClasses(cls);
      await loadEntries();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const toggleSection = (section: string) => {
    setSections((prev) => prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]);
  };

  const handlePublish = async () => {
    if (!teacherId) {
      toast({ title: "Not signed in", description: "Please sign in again.", variant: "destructive" });
      return;
    }
    if (!selectedClass || !diaryText.trim()) {
      toast({ title: "Missing Fields", description: "Select class and write diary entry.", variant: "destructive" });
      return;
    }
    setPublishing(true);
    const { error } = await supabase.from("diary").insert({
      teacher_id: teacherId,
      class_id: selectedClass,
      date: format(selectedDate, "yyyy-MM-dd"),
      subject: sections.join(", ") || null,
      notes: diaryText.trim(),
    });
    setPublishing(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Published!", description: "Diary entry saved." });
    setDiaryText("");
    setSections([]);
    loadEntries();
  };

  const handleDelete = async (id: string) => {
    // delete not allowed by RLS; just hide locally
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Removed from view", description: "Entry hidden locally." });
  };

  const classLabel = (id: string | null) => {
    if (!id) return "—";
    const c = classes.find((x) => x.id === id);
    return c ? `${c.name}-${c.section}` : "—";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground text-xl font-bold flex-1">Daily Diary</h1>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 bg-primary-foreground/10 rounded-xl px-3 py-2 text-xs font-semibold text-primary-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {format(selectedDate, "dd MMM")}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="bg-primary-foreground/10 border-0 text-primary-foreground rounded-xl h-11 text-sm font-semibold [&>svg]:text-primary-foreground">
            <SelectValue placeholder={classes.length === 0 ? "No classes assigned" : "Select Class"} />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 px-5 pt-5 pb-8 space-y-5">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-bold text-foreground">Today's Entry</p>
            <button
              onClick={() => setLanguage(language === "English" ? "Tamil" : "English")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground"
            >
              <Languages className="w-3.5 h-3.5" />
              {language}
            </button>
          </div>
          <textarea
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value.slice(0, maxChars))}
            placeholder={language === "English" ? "Write today's diary entry..." : "இன்றைய நாட்குறிப்பை எழுதுங்கள்..."}
            rows={6}
            className="w-full px-4 py-3 text-sm bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
            <p className="text-[10px] text-muted-foreground">{diaryText.length}/{maxChars}</p>
            <div className="flex gap-2">
              {["Homework", "Reminder", "Note"].map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSection(s)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors",
                    sections.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Plus className="w-3 h-3" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {publishing ? "Publishing…" : "Publish Diary"}
        </button>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Previous Entries</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No entries yet.</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-foreground">{format(new Date(entry.date), "dd MMM yyyy")}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">{classLabel(entry.class_id)}</p>
                    </div>
                    <button onClick={() => handleDelete(entry.id)} className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{entry.notes}</p>
                  {entry.subject && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {entry.subject.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-semibold">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyDiaryScreen;
