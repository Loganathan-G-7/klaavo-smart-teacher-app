import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Users, Send, Paperclip, Check, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const groupChats = [
  { id: "g1", name: "All Teachers", members: 45, lastMsg: "Staff meeting at 3 PM today", time: "10:30 AM", unread: 3 },
  { id: "g2", name: "Science Dept", members: 8, lastMsg: "Lab equipment list updated", time: "9:15 AM", unread: 0 },
  { id: "g3", name: "Primary Team", members: 12, lastMsg: "PTM schedule confirmed", time: "Yesterday", unread: 1 },
];

const individualChats = [
  { id: "c1", name: "Amit Verma", role: "Mathematics", lastMsg: "Sure, I'll share the notes", time: "11:00 AM", unread: 2 },
  { id: "c2", name: "Sneha Kapoor", role: "English", lastMsg: "Thanks for the update!", time: "10:45 AM", unread: 0 },
  { id: "c3", name: "Rahul Mehta", role: "Science", lastMsg: "Lab session rescheduled", time: "9:30 AM", unread: 0 },
  { id: "c4", name: "Pooja Nair", role: "Hindi", lastMsg: "Will send the report today", time: "Yesterday", unread: 0 },
  { id: "c5", name: "Vikas Singh", role: "Physical Ed", lastMsg: "Sports day preparations done", time: "Yesterday", unread: 5 },
];

const chatMessages = [
  { id: 1, sender: "Amit Verma", text: "Hi, do you have the Class 5 question paper?", time: "10:30 AM", sent: false, read: true },
  { id: 2, sender: "You", text: "Yes, I'll share it by afternoon.", time: "10:32 AM", sent: true, read: true },
  { id: 3, sender: "Amit Verma", text: "Great, thanks! Also need the lab manual.", time: "10:33 AM", sent: false, read: true },
  { id: 4, sender: "You", text: "Sure, I'll share the notes", time: "10:35 AM", sent: true, read: true },
  { id: 5, sender: "Amit Verma", text: "Perfect. See you at the meeting.", time: "10:50 AM", sent: false, read: false },
];

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

const ChatListScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredGroups = groupChats.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  const filteredIndividual = individualChats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="bg-primary px-6 pt-8 pb-5 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground text-xl font-bold">Staff Chat</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
          <input type="text" placeholder="Search chats..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-foreground/20" />
        </div>
      </div>

      <div className="flex-1 px-5 pt-4 pb-8 space-y-4">
        {/* Groups */}
        {filteredGroups.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Groups</p>
            <div className="space-y-2">
              {filteredGroups.map((g) => (
                <button key={g.id} onClick={() => navigate(`/chat/${g.id}`, { state: { chatName: g.name, isGroup: true } })}
                  className="w-full bg-card rounded-xl p-3.5 shadow-card flex items-center gap-3 text-left active:scale-[0.98] transition-all">
                  <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm truncate">{g.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{g.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{g.lastMsg}</p>
                  </div>
                  {g.unread > 0 && (
                    <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0 min-w-[20px] flex items-center justify-center rounded-full">{g.unread}</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Individual */}
        {filteredIndividual.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Direct Messages</p>
            <div className="space-y-2">
              {filteredIndividual.map((c) => (
                <button key={c.id} onClick={() => navigate(`/chat/${c.id}`, { state: { chatName: c.name, isGroup: false } })}
                  className="w-full bg-card rounded-xl p-3.5 shadow-card flex items-center gap-3 text-left active:scale-[0.98] transition-all">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{getInitials(c.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && (
                    <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0 min-w-[20px] flex items-center justify-center rounded-full">{c.unread}</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatScreen = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const chatName = (window.history.state?.usr as any)?.chatName || "Chat";

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-4 rounded-b-[1.5rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">{getInitials(chatName)}</span>
          </div>
          <div>
            <h1 className="text-primary-foreground text-base font-bold">{chatName}</h1>
            <p className="text-primary-foreground/50 text-[11px]">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sent ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"}`}>
              <p className="text-sm">{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.sent ? "justify-end" : ""}`}>
                <span className={`text-[10px] ${msg.sent ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{msg.time}</span>
                {msg.sent && (msg.read ? <CheckCheck className="w-3.5 h-3.5 text-accent" /> : <Check className="w-3.5 h-3.5 text-primary-foreground/40" />)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-card border-t border-border flex items-center gap-2">
        <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
        </button>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..."
          className="flex-1 bg-secondary rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ChatListScreen;
