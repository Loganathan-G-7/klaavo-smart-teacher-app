import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, CalendarOff, MessageCircle, User } from "lucide-react";

const items = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: BookOpen, label: "Classes", path: "/classes" },
  { icon: CalendarOff, label: "Leave", path: "/leave" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      {/* Spacer so content isn't hidden behind the fixed bar */}
      <div aria-hidden className="h-16" />
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border px-4 py-2 flex justify-around items-center shadow-card-lg z-40">
        {items.map((item) => {
          const active =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 py-1 px-3"
            >
              <item.icon
                className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[10px] font-semibold ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNav;
