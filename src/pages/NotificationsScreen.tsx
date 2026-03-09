import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, FileText, CalendarCheck, CreditCard, PartyPopper, CheckCheck } from "lucide-react";

const notificationsData = [
  { id: 1, type: "circular", icon: FileText, title: "New Circular", message: "Annual day preparation circular has been published.", time: "10 min ago", read: false },
  { id: 2, type: "leave", icon: CalendarCheck, title: "Leave Approved", message: "Your casual leave for 10-11 March has been approved.", time: "1 hour ago", read: false },
  { id: 3, type: "fee", icon: CreditCard, title: "Fee Alert", message: "3 students have pending transport fees in LKG-A.", time: "2 hours ago", read: false },
  { id: 4, type: "event", icon: PartyPopper, title: "Upcoming Event", message: "Parent-Teacher meeting scheduled for 15 March.", time: "3 hours ago", read: true },
  { id: 5, type: "circular", icon: FileText, title: "Exam Schedule", message: "Final exam schedule for all classes has been published.", time: "Yesterday", read: true },
  { id: 6, type: "leave", icon: CalendarCheck, title: "Leave Rejected", message: "Your emergency leave request for 5 Feb was rejected.", time: "2 days ago", read: true },
  { id: 7, type: "event", icon: PartyPopper, title: "Sports Day", message: "Annual sports day is on 20 March. Please prepare.", time: "3 days ago", read: true },
];

const typeStyles: Record<string, string> = {
  circular: "bg-accent/15 text-accent",
  leave: "bg-success/15 text-success",
  fee: "bg-amber-500/15 text-amber-600",
  event: "bg-purple-500/15 text-purple-600",
};

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(notificationsData);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div>
              <h1 className="text-primary-foreground text-xl font-bold">Notifications</h1>
              {unreadCount > 0 && <p className="text-primary-foreground/50 text-xs">{unreadCount} unread</p>}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-primary-foreground/70 flex items-center gap-1">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 pt-4 pb-8 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-14 h-14 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`bg-card rounded-xl p-4 shadow-card flex items-start gap-3 transition-all ${!n.read ? "border-l-4 border-accent" : ""}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeStyles[n.type]}`}>
                <n.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!n.read ? "font-bold" : "font-semibold"} text-foreground`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
