import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialRequests = [
  { id: 1, teacher: "Anita Kumar", type: "Casual Leave", dates: "Mar 12 - Mar 13", reason: "Family function in hometown", status: "pending" },
  { id: 2, teacher: "Rajesh Menon", type: "Medical Leave", dates: "Mar 14 - Mar 16", reason: "Doctor appointment and recovery", status: "pending" },
  { id: 3, teacher: "Sunita Devi", type: "Emergency Leave", dates: "Mar 11", reason: "Urgent family emergency", status: "pending" },
  { id: 4, teacher: "Vikram Singh", type: "Earned Leave", dates: "Mar 20 - Mar 25", reason: "Personal travel planned months ago", status: "pending" },
] as { id: number; teacher: string; type: string; dates: string; reason: string; status: "pending" | "approved" | "rejected" }[];
];

const AdminApprovalScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  const handleAction = (id: number, action: "approved" | "rejected") => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
    toast({
      title: action === "approved" ? "Leave Approved" : "Leave Rejected",
      description: `Request has been ${action}${remarks[id] ? ` with remarks: "${remarks[id]}"` : ""}`,
    });
  };

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-primary px-6 pt-8 pb-5 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">Leave Approvals</h1>
          <span className="ml-auto bg-primary-foreground/20 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
            {pending.length} pending
          </span>
        </div>
      </div>

      <div className="flex-1 px-6 pt-5 pb-8 space-y-6">
        {pending.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Pending Requests</h3>
            <div className="space-y-3">
              {pending.map((req) => (
                <div key={req.id} className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                      {req.teacher.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{req.teacher}</p>
                      <p className="text-xs text-muted-foreground">{req.type} • {req.dates}</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/80 mb-3">{req.reason}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Add remarks (optional)"
                      value={remarks[req.id] || ""}
                      onChange={(e) => setRemarks((p) => ({ ...p, [req.id]: e.target.value }))}
                      className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(req.id, "approved")}
                      className="flex-1 py-2.5 bg-success text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "rejected")}
                      className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {processed.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Processed</h3>
            <div className="space-y-3">
              {processed.map((req) => (
                <div key={req.id} className="bg-card rounded-xl p-4 shadow-card opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                      {req.teacher.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{req.teacher}</p>
                      <p className="text-xs text-muted-foreground">{req.type} • {req.dates}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      req.status === "approved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    }`}>
                      {req.status === "approved" ? "Approved" : "Rejected"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && processed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Check className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-semibold">No pending requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalScreen;
