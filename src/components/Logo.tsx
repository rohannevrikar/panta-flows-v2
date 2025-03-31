
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
}

const Logo = ({ className, variant = "default" }: LogoProps) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const textColor = variant === "white" ? "text-white" : "text-gray-900";
  const subtitleColor = variant === "white" ? "text-white/70" : "text-gray-600";

  const handleClick = () => {
    navigate("/dashboard");
  };

  return (
    <div 
      className={cn("flex items-center cursor-pointer", className)}
      onClick={handleClick}
    >
      {theme.logo ? (
        <img src={theme.logo} alt={theme.clientName} className="h-10 w-10 mr-2" />
      ) : (
        <div 
          className="h-10 w-10 rounded-md flex items-center justify-center text-white font-bold text-xl mr-2"
          style={{ 
            background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})` 
          }}
        >
          {theme.clientName.charAt(0)}
        </div>
      )}
      <div className="flex flex-col">
        <span className={cn("font-bold text-lg", textColor)}>
          {theme.clientName}
        </span>
        <span className={cn("text-sm", subtitleColor)}>Flows</span>
      </div>
    </div>
  );
};

export default Logo;
