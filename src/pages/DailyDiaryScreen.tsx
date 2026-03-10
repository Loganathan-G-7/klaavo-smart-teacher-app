import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, Edit2, Trash2, Languages } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const classList = ["LKG-A", "LKG-B", "Class 1-A", "Class 2-B", "Class 3-A", "Class 5-B"];

const previousEntries = [
  { id: 1, date: "09 Mar 2026", cls: "LKG-A", text: "Today we practiced alphabet writing A-E. Homework: Write each letter 5 times in notebook.", sections: ["Homework"] },
  { id: 2, date: "08 Mar 2026", cls: "Class 2-B", text: "Completed multiplication tables 2-5. Reminder: Bring color pencils tomorrow.", sections: ["Homework", "Reminder"] },
  { id: 3, date: "07 Mar 2026", cls: "Class 5-B", text: "Science experiment on plant growth discussed. Note: Submit project report by Friday.", sections: ["Note"] },
  { id: 4, date: "06 Mar 2026", cls: "LKG-A", text: "Rhyme recitation practice. All students performed well today.", sections: [] },
];

const DailyDiaryScreen = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState("");
  const [diaryText, setDiaryText] = useState("");
  const [language, setLanguage] = useState<"English" | "Tamil">("English");
  const [sections, setSections] = useState<string[]>([]);
  const maxChars = 1000;

  const toggleSection = (section: string) => {
    setSections((prev) => prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]);
  };

  const handlePublish = () => {
    if (!selectedClass || !diaryText.trim()) {
      toast({ title: "Missing Fields", description: "Select class and write diary entry.", variant: "destructive" });
      return;
    }
    toast({ title: "Published!", description: `Diary published for ${selectedClass}.` });
    setDiaryText("");
    setSections([]);
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

        {/* Class Selector */}
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="bg-primary-foreground/10 border-0 text-primary-foreground rounded-xl h-11 text-sm font-semibold [&>svg]:text-primary-foreground">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classList.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-5 pb-8 space-y-5">
        {/* Diary Editor */}
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

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Publish Diary
        </button>

        {/* Previous Entries */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Previous Entries</h3>
          <div className="space-y-3">
            {previousEntries.map((entry) => (
              <div key={entry.id} className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-foreground">{entry.date}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">{entry.cls}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{entry.text}</p>
                {entry.sections.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {entry.sections.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-semibold">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDiaryScreen;
