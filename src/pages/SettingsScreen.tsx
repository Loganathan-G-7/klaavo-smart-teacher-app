import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Bell, Phone, Shield, Info, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState("english");
  const [notifLeave, setNotifLeave] = useState(true);
  const [notifCircular, setNotifCircular] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifEvent, setNotifEvent] = useState(false);

  const handleLogout = () => {
    toast({ title: "Logged out", description: "You have been logged out successfully" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-primary px-6 pt-8 pb-5 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">Settings</h1>
        </div>
      </div>

      <div className="flex-1 px-6 pt-5 pb-8 space-y-4">
        {/* Language */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-accent" />
            <span className="font-bold text-foreground text-sm">Language</span>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl p-4 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-accent" />
            <span className="font-bold text-foreground text-sm">Notifications</span>
          </div>
          {[
            { label: "Leave Updates", value: notifLeave, set: setNotifLeave },
            { label: "Circulars", value: notifCircular, set: setNotifCircular },
            { label: "Chat Messages", value: notifChat, set: setNotifChat },
            { label: "Events", value: notifEvent, set: setNotifEvent },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{item.label}</span>
              <Switch checked={item.value} onCheckedChange={item.set} />
            </div>
          ))}
        </div>

        {/* Change Mobile */}
        <button className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-3 text-left">
          <Phone className="w-5 h-5 text-accent" />
          <div>
            <p className="font-bold text-foreground text-sm">Change Mobile Number</p>
            <p className="text-xs text-muted-foreground">+91 98765 43210</p>
          </div>
        </button>

        {/* Privacy */}
        <button className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-3 text-left">
          <Shield className="w-5 h-5 text-accent" />
          <p className="font-bold text-foreground text-sm">Privacy Policy</p>
        </button>

        {/* About */}
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3">
          <Info className="w-5 h-5 text-accent" />
          <div>
            <p className="font-bold text-foreground text-sm">About Klaavo</p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl border border-destructive/30 text-destructive font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-4"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
