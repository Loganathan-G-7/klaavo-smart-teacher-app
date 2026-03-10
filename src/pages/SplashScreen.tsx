import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import klaavoLogo from "@/assets/klaavo-logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const dotTimer = setInterval(() => setDotIndex((p) => (p + 1) % 3), 400);
    const navTimer = setTimeout(() => navigate("/login"), 2500);
    return () => {
      clearInterval(dotTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center max-w-md mx-auto relative">
      <div className="flex flex-col items-center animate-fade-in">
        <img src={klaavoLogo} alt="Klaavo" className="w-24 h-24 mb-4 brightness-0 invert" />
        <h1 className="text-4xl font-extrabold text-primary-foreground tracking-tight">Klaavo</h1>
        <p className="text-primary-foreground/50 text-sm mt-2 font-medium">Smart School Management</p>
      </div>

      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === dotIndex ? "bg-primary-foreground scale-125" : "bg-primary-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
