import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OTPScreen = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as any)?.phone || "XXXXXXXXXX";

  const maskedPhone = phone.length === 10
    ? phone.slice(0, 2) + "XXXXXX" + phone.slice(8)
    : phone;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp !== "1234") {
      setError("Invalid OTP. Please try again.");
      toast.error("Invalid OTP entered");
      return;
    }

    setVerifying(true);
    try {
      // Fetch teacher by phone number
      const { data: teacher, error: dbError } = await supabase
        .from("teachers")
        .select("id, name, designation, department, school_name")
        .eq("phone", phone)
        .maybeSingle();

      if (dbError) throw dbError;

      if (teacher) {
        localStorage.setItem("teacher_id", teacher.id);
        localStorage.setItem("teacher_name", teacher.name);
        localStorage.setItem("teacher_designation", teacher.designation || "");
        localStorage.setItem("teacher_department", teacher.department || "");
        localStorage.setItem("teacher_school", teacher.school_name || "");
      } else {
        // If no teacher found, store phone as fallback
        localStorage.setItem("teacher_phone", phone);
        localStorage.setItem("teacher_name", "Teacher");
      }

      toast.success("OTP verified successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error fetching teacher:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col px-6 pt-6 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-10">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-8">
          <Mail className="w-9 h-9 text-accent" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">Enter Verification Code</h2>
        <p className="text-muted-foreground text-sm text-center mb-10">
          We have sent OTP to +91 {maskedPhone}
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-4 mb-3">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-14 rounded-lg bg-secondary text-center text-xl font-bold text-foreground outline-none border-2 transition-colors shadow-card ${
                error ? "border-destructive" : "border-transparent focus:border-primary"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-destructive text-sm font-medium mb-3">{error}</p>
        )}

        {/* Hint */}
        <p className="text-muted-foreground text-xs mb-3">Use OTP: 1234 for testing</p>

        {/* Resend */}
        <button className="text-accent font-semibold text-sm mb-10 hover:underline">
          Resend OTP
        </button>

        {/* Verify */}
        <button
          onClick={handleVerify}
          disabled={!otp.every((d) => d) || verifying}
          className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-bold text-base shadow-card-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default OTPScreen;
