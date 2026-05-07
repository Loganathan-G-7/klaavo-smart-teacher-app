import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Phone, Mail, Droplet, Calendar, LogOut, Globe, Bell as BellIcon } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const profileInfo = {
  name: "Priya Sharma",
  designation: "Senior Teacher",
  department: "Science Department",
  mobile: "+91 98765 43210",
  email: "priya.sharma@dps.edu",
  bloodGroup: "O+",
  doj: "15 June 2018",
};

const attendanceSummary = [
  { label: "Present", count: 22, color: "text-success bg-success/10" },
  { label: "Absent", count: 1, color: "text-destructive bg-destructive/10" },
  { label: "Late", count: 2, color: "text-amber-500 bg-amber-500/10" },
  { label: "Leave", count: 1, color: "text-accent bg-accent/10" },
];

const leaveBalance = [
  { type: "CL", remaining: 8, total: 12 },
  { type: "ML", remaining: 10, total: 10 },
  { type: "EL", remaining: 15, total: 15 },
];

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("english");
  const [notificationsOn, setNotificationsOn] = useState(true);

  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground text-xl font-bold">My Profile</h1>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-primary-foreground/15 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">PS</span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-card-lg">
              <Camera className="w-4 h-4 text-accent-foreground" />
            </button>
          </div>
          <h2 className="text-primary-foreground text-lg font-bold">{profileInfo.name}</h2>
          <p className="text-primary-foreground/60 text-sm">{profileInfo.designation}</p>
          <p className="text-primary-foreground/40 text-xs mt-0.5">{profileInfo.department}</p>
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 pb-8 space-y-5">
        {/* Info Cards */}
        <div className="space-y-2">
          {[
            { icon: Phone, label: "Mobile", value: profileInfo.mobile },
            { icon: Mail, label: "Email", value: profileInfo.email },
            { icon: Droplet, label: "Blood Group", value: profileInfo.bloodGroup },
            { icon: Calendar, label: "Date of Joining", value: profileInfo.doj },
          ].map((item) => (
            <div key={item.label} className="bg-card rounded-xl p-3.5 shadow-card flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance Summary */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">This Month's Attendance</h3>
          <div className="grid grid-cols-4 gap-2">
            {attendanceSummary.map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-3 shadow-card text-center">
                <div className={`w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center ${s.color}`}>
                  <span className="text-base font-bold">{s.count}</span>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Balance */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Leave Balance</h3>
          <div className="flex gap-3">
            {leaveBalance.map((lb) => (
              <div key={lb.type} className="flex-1 bg-card rounded-xl p-3 shadow-card text-center">
                <p className="text-xl font-extrabold text-primary">{lb.remaining}</p>
                <p className="text-[10px] text-muted-foreground">of {lb.total}</p>
                <p className="text-[11px] font-semibold text-foreground mt-0.5">{lb.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Settings</h3>
          <div className="space-y-2">
            <div className="bg-card rounded-xl p-3.5 shadow-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Language</span>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-28 h-9 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card rounded-xl p-3.5 shadow-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BellIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Notifications</span>
              </div>
              <Switch checked={notificationsOn} onCheckedChange={setNotificationsOn} />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full py-3.5 rounded-xl border-2 border-destructive/30 text-destructive font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-destructive/5 active:scale-[0.98]">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
