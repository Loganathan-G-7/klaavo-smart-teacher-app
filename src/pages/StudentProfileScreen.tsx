import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Phone, Calendar, Droplet, User, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const personalInfo = {
  name: "Aarav Sharma",
  class: "LKG-A",
  dob: "15 March 2019",
  parentName: "Rajesh Sharma",
  mobile: "+91 98765 43210",
  bloodGroup: "B+",
};

const attendanceData = {
  present: 22,
  absent: 3,
  late: 1,
  total: 26,
  calendar: [
    { day: 1, status: "P" }, { day: 2, status: "P" }, { day: 3, status: "A" },
    { day: 4, status: "P" }, { day: 5, status: "P" }, { day: 6, status: "L" },
    { day: 7, status: "P" }, { day: 8, status: "P" }, { day: 9, status: "P" },
    { day: 10, status: "A" }, { day: 11, status: "P" }, { day: 12, status: "P" },
    { day: 13, status: "P" }, { day: 14, status: "P" }, { day: 15, status: "A" },
    { day: 16, status: "P" }, { day: 17, status: "P" }, { day: 18, status: "P" },
    { day: 19, status: "P" }, { day: 20, status: "P" }, { day: 21, status: "P" },
    { day: 22, status: "P" }, { day: 23, status: "P" }, { day: 24, status: "P" },
    { day: 25, status: "P" }, { day: 26, status: "P" },
  ],
};

const resultsData = [
  { subject: "English", marks: 92, total: 100, grade: "A+" },
  { subject: "Mathematics", marks: 88, total: 100, grade: "A" },
  { subject: "Science", marks: 95, total: 100, grade: "A+" },
  { subject: "Hindi", marks: 78, total: 100, grade: "B+" },
  { subject: "Social Studies", marks: 85, total: 100, grade: "A" },
  { subject: "Computer", marks: 90, total: 100, grade: "A+" },
];

const feesData = [
  { category: "Tuition Fee", amount: 25000, paid: 25000, pending: 0 },
  { category: "Transport Fee", amount: 12000, paid: 8000, pending: 4000 },
  { category: "Lab Fee", amount: 5000, paid: 5000, pending: 0 },
  { category: "Activity Fee", amount: 8000, paid: 3000, pending: 5000 },
];

const StudentProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentName = (location.state as any)?.studentName || personalInfo.name;
  const className = (location.state as any)?.className || personalInfo.class;
  const [activeTab, setActiveTab] = useState("personal");

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  const totalMarks = resultsData.reduce((a, r) => a + r.marks, 0);
  const totalMax = resultsData.reduce((a, r) => a + r.total, 0);
  const percentage = ((totalMarks / totalMax) * 100).toFixed(1);

  const totalFees = feesData.reduce((a, f) => a + f.amount, 0);
  const totalPaid = feesData.reduce((a, f) => a + f.paid, 0);
  const totalPending = feesData.reduce((a, f) => a + f.pending, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground text-lg font-bold">Student Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/15 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-primary-foreground">
              {getInitials(studentName)}
            </span>
          </div>
          <h2 className="text-primary-foreground text-lg font-bold">{studentName}</h2>
          <p className="text-primary-foreground/60 text-sm">{className}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 px-5 pt-5 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-secondary rounded-xl h-11 p-1 mb-5">
            {["personal", "attendance", "results", "fees"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 text-xs font-semibold capitalize rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Personal */}
          <TabsContent value="personal" className="space-y-3 mt-0">
            {[
              { icon: User, label: "Full Name", value: studentName },
              { icon: Calendar, label: "Class", value: className },
              { icon: Calendar, label: "Date of Birth", value: personalInfo.dob },
              { icon: User, label: "Parent Name", value: personalInfo.parentName },
              { icon: Phone, label: "Mobile", value: personalInfo.mobile },
              { icon: Droplet, label: "Blood Group", value: personalInfo.bloodGroup },
            ].map((item) => (
              <div key={item.label} className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Attendance */}
          <TabsContent value="attendance" className="mt-0 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Present", count: attendanceData.present, color: "text-success bg-success/10" },
                { label: "Absent", count: attendanceData.absent, color: "text-destructive bg-destructive/10" },
                { label: "Late", count: attendanceData.late, color: "text-amber-500 bg-amber-500/10" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-3 shadow-card text-center">
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${s.color}`}>
                    <span className="text-lg font-bold">{s.count}</span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="bg-card rounded-xl p-4 shadow-card">
              <p className="text-sm font-bold text-foreground mb-3">
                {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
              <div className="grid grid-cols-7 gap-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="text-[10px] font-semibold text-muted-foreground text-center">
                    {d}
                  </span>
                ))}
                {/* Offset for month start (assuming starts on Saturday) */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={`empty-${i}`} />
                ))}
                {attendanceData.calendar.map((d) => (
                  <div
                    key={d.day}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold mx-auto ${
                      d.status === "P"
                        ? "bg-success/15 text-success"
                        : d.status === "A"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    {d.day}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Results */}
          <TabsContent value="results" className="mt-0 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 bg-card rounded-xl p-3 shadow-card text-center">
                <p className="text-2xl font-extrabold text-primary">{percentage}%</p>
                <p className="text-[11px] text-muted-foreground font-medium">Percentage</p>
              </div>
              <div className="flex-1 bg-card rounded-xl p-3 shadow-card text-center">
                <p className="text-2xl font-extrabold text-success">A</p>
                <p className="text-[11px] text-muted-foreground font-medium">Overall Grade</p>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="grid grid-cols-4 gap-0 bg-secondary px-4 py-2.5">
                {["Subject", "Marks", "Total", "Grade"].map((h) => (
                  <span key={h} className="text-[11px] font-semibold text-muted-foreground">
                    {h}
                  </span>
                ))}
              </div>
              {resultsData.map((r, i) => (
                <div
                  key={r.subject}
                  className={`grid grid-cols-4 gap-0 px-4 py-3 ${
                    i < resultsData.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-xs font-semibold text-foreground">{r.subject}</span>
                  <span className="text-xs font-medium text-foreground">{r.marks}</span>
                  <span className="text-xs text-muted-foreground">{r.total}</span>
                  <span
                    className={`text-xs font-bold ${
                      r.grade.startsWith("A") ? "text-success" : "text-accent"
                    }`}
                  >
                    {r.grade}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Fees */}
          <TabsContent value="fees" className="mt-0 space-y-4">
            {/* Summary */}
            <div className="flex gap-3">
              <div className="flex-1 bg-card rounded-xl p-3 shadow-card text-center">
                <p className="text-lg font-extrabold text-success">₹{totalPaid.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Paid</p>
              </div>
              <div className="flex-1 bg-card rounded-xl p-3 shadow-card text-center">
                <p className="text-lg font-extrabold text-destructive">₹{totalPending.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Pending</p>
              </div>
            </div>

            <div className="space-y-3">
              {feesData.map((fee) => (
                <div key={fee.category} className="bg-card rounded-xl p-4 shadow-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{fee.category}</p>
                      <p className="text-xs text-muted-foreground">Total: ₹{fee.amount.toLocaleString()}</p>
                    </div>
                    {fee.pending > 0 && (
                      <span className="text-xs font-bold text-destructive">
                        ₹{fee.pending.toLocaleString()} due
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fee.pending === 0 ? "bg-success" : "bg-accent"
                      }`}
                      style={{ width: `${(fee.paid / fee.amount) * 100}%` }}
                    />
                  </div>
                  {fee.pending > 0 && (
                    <button
                      onClick={() =>
                        toast({
                          title: "Follow-up Noted",
                          description: `Follow-up note added for ${fee.category}.`,
                        })
                      }
                      className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-accent"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Add Follow-up Note
                    </button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentProfileScreen;
