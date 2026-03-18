import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, LogIn, LogOut } from "lucide-react";
import { format, parse } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  location: string | null;
}

function calcSessionSeconds(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const cin = checkIn.split(":").map(Number);
  const cout = checkOut.split(":").map(Number);
  const inSec = cin[0] * 3600 + cin[1] * 60 + (cin[2] || 0);
  const outSec = cout[0] * 3600 + cout[1] * 60 + (cout[2] || 0);
  return outSec > inSec ? outSec - inSec : 0;
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

function formatHHMM(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

const AttendanceDetailScreen = () => {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const teacherId = localStorage.getItem("teacher_id") || "";

  useEffect(() => {
    if (!teacherId || !date) return;
    const fetchRecords = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("date", date)
        .order("check_in", { ascending: true });
      if (!error && data) setRecords(data as unknown as AttendanceRecord[]);
      setLoading(false);
    };
    fetchRecords();
  }, [teacherId, date]);

  const totalSeconds = useMemo(() => {
    return records.reduce((acc, r) => acc + calcSessionSeconds(r.check_in, r.check_out), 0);
  }, [records]);

  const totalHours = totalSeconds / 3600;
  const isPresent = totalHours >= 8;
  const hasRecords = records.length > 0;
  const lastRec = hasRecords ? records[records.length - 1] : null;
  const isInProgress = hasRecords && !lastRec?.check_out;

  let statusLabel = "Absent";
  let statusClass = "bg-destructive/15 text-destructive";
  if (isPresent) {
    statusLabel = "Present";
    statusClass = "bg-success/15 text-success";
  } else if (isInProgress) {
    statusLabel = "In Progress";
    statusClass = "bg-primary/15 text-primary";
  }

  const displayDate = date
    ? (() => {
        try {
          const d = parse(date, "yyyy-MM-dd", new Date());
          return format(d, "EEEE, dd MMMM yyyy");
        } catch {
          return date;
        }
      })()
    : "";

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: "#1A1A1A" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#2A2A2A" }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-lg font-bold">Attendance Detail</h1>
        </div>

        {/* Date & Status */}
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "#2A2A2A" }}>
          <div>
            <p className="text-white font-semibold text-sm">{displayDate}</p>
            <p className="text-gray-400 text-xs mt-1">
              {records.length} session{records.length !== 1 ? "s" : ""} · Total: {formatHHMM(totalSeconds)} hrs
            </p>
          </div>
          <Badge className={cn("text-xs px-3 py-1", statusClass)}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Sessions */}
      <div className="flex-1 px-5 pb-6 overflow-y-auto space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No attendance records for this date</p>
          </div>
        ) : (
          records.map((rec, idx) => {
            const sessionSec = calcSessionSeconds(rec.check_in, rec.check_out);
            return (
              <div key={rec.id} className="rounded-xl p-4" style={{ background: "#2A2A2A" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-bold text-sm">Session {idx + 1}</p>
                  <span className="text-gray-400 text-xs font-semibold">
                    {formatHHMM(sessionSec)} hrs
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {/* Check-in */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center">
                      <LogIn className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 font-medium">Check-in</p>
                      <p className="text-green-400 text-sm font-semibold">{formatTime12(rec.check_in)}</p>
                      {rec.location && (
                        <div className="flex items-start gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-gray-500 leading-relaxed">{rec.location}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Check-out */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center">
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 font-medium">Check-out</p>
                      <p className="text-red-400 text-sm font-semibold">
                        {rec.check_out ? formatTime12(rec.check_out) : "In Progress"}
                      </p>
                      {rec.location && (
                        <div className="flex items-start gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-gray-500 leading-relaxed">{rec.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Duration bar */}
                {rec.check_in && rec.check_out && (
                  <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "#1A1A1A" }}>
                    <p className="text-xs text-gray-400 font-semibold text-center">
                      Duration: {formatHHMM(sessionSec)} hrs
                    </p>
                  </div>
                )}

                {/* Add Notes */}
                {editingNote === rec.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={notes[rec.id] || ""}
                      onChange={(e) => setNotes({ ...notes, [rec.id]: e.target.value })}
                      placeholder="Add notes..."
                      rows={2}
                      className="w-full rounded-xl border border-gray-600 bg-transparent px-3 py-2 text-sm text-white resize-none outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setEditingNote(null)}
                      className="text-xs text-blue-400 font-semibold"
                    >
                      Save Note
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingNote(rec.id)}
                    className="text-xs text-blue-400 font-semibold"
                  >
                    {notes[rec.id] ? `📝 ${notes[rec.id]}` : "+ Add notes"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendanceDetailScreen;