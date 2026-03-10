import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, Upload, Image, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const eventsData = [
  { id: 1, title: "Annual Day 2026", date: "20 Mar 2026", description: "Grand annual day celebration with cultural performances, awards ceremony, and parent participation.", photos: 24, featured: true, color: "from-accent to-primary" },
  { id: 2, title: "Science Exhibition", date: "15 Mar 2026", description: "Students showcase their science projects and innovative models.", photos: 18, featured: false, color: "from-success to-accent" },
  { id: 3, title: "Republic Day Celebration", date: "26 Jan 2026", description: "Flag hoisting ceremony followed by patriotic performances.", photos: 32, featured: false, color: "from-primary to-accent" },
  { id: 4, title: "Sports Day", date: "10 Jan 2026", description: "Inter-house sports competition with various track and field events.", photos: 45, featured: false, color: "from-destructive to-primary" },
  { id: 5, title: "Christmas Celebration", date: "24 Dec 2025", description: "Fun-filled Christmas celebration with carols and gift exchange.", photos: 20, featured: false, color: "from-accent to-success" },
  { id: 6, title: "Children's Day", date: "14 Nov 2025", description: "Special programs organized by teachers for students.", photos: 28, featured: false, color: "from-success to-primary" },
];

const EventsGalleryScreen = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<typeof eventsData[0] | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");

  const featured = eventsData.find((e) => e.featured);
  const others = eventsData.filter((e) => !e.featured);

  const handlePost = () => {
    if (!title.trim() || !eventDate || !description.trim() || !audience) {
      toast({ title: "Missing Fields", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Event Posted!", description: `"${title}" has been published.` });
    setPostOpen(false);
    setTitle("");
    setEventDate(undefined);
    setDescription("");
    setAudience("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-primary-foreground text-xl font-bold">Events & Gallery</h1>
          </div>
          <Dialog open={postOpen} onOpenChange={setPostOpen}>
            <DialogTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl mx-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground">Post Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Event Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter event title" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn("w-full flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm", !eventDate && "text-muted-foreground")}>
                        <Calendar className="w-4 h-4" />
                        {eventDate ? format(eventDate, "dd MMM yyyy") : "Select date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent mode="single" selected={eventDate} onSelect={setEventDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the event..." rows={3} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Upload Photos</label>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm text-muted-foreground hover:border-primary/40 transition-colors">
                    <Upload className="w-4 h-4" />
                    Choose Photos
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Audience</label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-parents">All Parents</SelectItem>
                      <SelectItem value="specific-class">Specific Class</SelectItem>
                      <SelectItem value="everyone">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button onClick={handlePost} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98]">
                  Publish Event
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-5 pb-8 space-y-5">
        {/* Featured Event */}
        {featured && (
          <button onClick={() => setSelectedEvent(featured)} className="w-full text-left">
            <div className={cn("relative rounded-2xl overflow-hidden bg-gradient-to-br p-6 min-h-[180px] flex flex-col justify-end shadow-card-lg", featured.color)}>
              <div className="absolute top-3 right-3 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                <Image className="w-3 h-3 text-primary-foreground" />
                <span className="text-[10px] font-bold text-primary-foreground">{featured.photos} Photos</span>
              </div>
              <p className="text-xs text-primary-foreground/70 font-semibold">{featured.date}</p>
              <p className="text-lg font-extrabold text-primary-foreground mt-1">{featured.title}</p>
              <p className="text-xs text-primary-foreground/70 mt-1 line-clamp-2">{featured.description}</p>
            </div>
          </button>
        )}

        {/* Events Grid */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">All Events</h3>
          <div className="grid grid-cols-2 gap-3">
            {others.map((event) => (
              <button key={event.id} onClick={() => setSelectedEvent(event)} className="text-left bg-card rounded-xl overflow-hidden shadow-card transition-all active:scale-[0.97]">
                <div className={cn("h-24 bg-gradient-to-br flex items-center justify-center", event.color)}>
                  <Image className="w-8 h-8 text-primary-foreground/40" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-foreground line-clamp-1">{event.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{event.date}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{event.photos} photos</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Detail */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground pr-6">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-1">
            <div className={cn("h-40 rounded-xl bg-gradient-to-br flex items-center justify-center", selectedEvent?.color)}>
              <Image className="w-12 h-12 text-primary-foreground/30" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{selectedEvent?.date}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{selectedEvent?.description}</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={cn("h-20 rounded-lg bg-gradient-to-br opacity-60 flex items-center justify-center", selectedEvent?.color)}>
                  <Image className="w-5 h-5 text-primary-foreground/40" />
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">+{(selectedEvent?.photos || 0) - 6} more photos</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsGalleryScreen;
