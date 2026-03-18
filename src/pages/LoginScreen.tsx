import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight } from "lucide-react";
import klaavoLogo from "@/assets/klaavo-logo.png";

const LoginScreen = () => {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (phone.length === 10) {
      navigate("/otp", { state: { phone } });
    }
  };

  return (
    <div className="min-h-screen bg-card flex flex-col items-center px-6 pt-16 pb-8 max-w-md mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center mb-12">
        <img src={klaavoLogo} alt="Klaavo" className="w-16 h-16 mb-3" />
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Klaavo</h1>
        <p className="text-muted-foreground text-sm mt-1 font-medium">Smart School Management</p>
      </div>

      {/* Phone Icon */}
      <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-8">
        <Phone className="w-9 h-9 text-accent" />
      </div>

      {/* Welcome */}
      <h2 className="text-xl font-bold text-foreground mb-8">Welcome to Klaavo</h2>

      {/* Phone Input */}
      <div className="w-full mb-6">
        <div className="flex items-center gap-3 border-b-2 border-input pb-3 focus-within:border-primary transition-colors">
          <span className="text-foreground font-semibold text-base">+91</span>
          <div className="w-px h-5 bg-border" />
          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter mobile number"
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base font-medium tracking-wider"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={phone.length !== 10}
        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-card-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 mt-4"
      >
        <ArrowRight className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Helper */}
      <p className="text-muted-foreground text-sm mt-6 text-center">
        We will send you a one time password
      </p>
    </div>
  );
};

export default LoginScreen;