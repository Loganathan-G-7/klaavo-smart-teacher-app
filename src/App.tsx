import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginScreen from "./pages/LoginScreen";
import OTPScreen from "./pages/OTPScreen";
import DashboardScreen from "./pages/DashboardScreen";
import CheckInScreen from "./pages/CheckInScreen";
import MyClassesScreen from "./pages/MyClassesScreen";
import StudentListScreen from "./pages/StudentListScreen";
import StudentProfileScreen from "./pages/StudentProfileScreen";
import LeaveScreen from "./pages/LeaveScreen";
import ChatListScreen, { ChatScreen } from "./pages/ChatScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import ProfileScreen from "./pages/ProfileScreen";
import DailyDiaryScreen from "./pages/DailyDiaryScreen";
import CircularsScreen from "./pages/CircularsScreen";
import EventsGalleryScreen from "./pages/EventsGalleryScreen";
import RemoteLoginScreen from "./pages/RemoteLoginScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/otp" element={<OTPScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/checkin" element={<CheckInScreen />} />
          <Route path="/classes" element={<MyClassesScreen />} />
          <Route path="/class/:classId" element={<StudentListScreen />} />
          <Route path="/student/:studentId" element={<StudentProfileScreen />} />
          <Route path="/leave" element={<LeaveScreen />} />
          <Route path="/chat" element={<ChatListScreen />} />
          <Route path="/chat/:chatId" element={<ChatScreen />} />
          <Route path="/notifications" element={<NotificationsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
