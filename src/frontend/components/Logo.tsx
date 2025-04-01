
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTheme } from "@/frontend/contexts/ThemeContext";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  onClick?: () => void;
  small?: boolean;
}

const Logo = ({ className, variant = "default", onClick, small = false }: LogoProps) => {
  const { theme } = useTheme();
  
  // Fallback logo in case theme.logo is undefined
  const logoSrc = theme.logo || "/panta-logo.png";
  const clientName = theme.clientName || "PANTA";
  
  return (
    <Link to="/dashboard" className="no-underline">
      <div 
        onClick={onClick} 
        className={cn("font-bold flex items-center cursor-pointer", 
          small ? "text-base" : "text-xl",
          className
        )}
      >
        <img 
          src={logoSrc} 
          alt={`${clientName} Logo`} 
          className={cn(small ? "h-7 mr-1" : "h-10 mr-2")} 
          onError={(e) => {
            e.currentTarget.src = "/panta-logo.png";
            console.error("Failed to load logo:", logoSrc);
          }}
        />
        {!small && (
          <>
            <span className={cn(
              "mr-1 tracking-wider", 
              variant === "white" ? "text-white" : "text-black"
            )}>
              {clientName.toUpperCase()}
            </span>
            {clientName.toLowerCase() === "panta" && (
              <span className={cn(
                "font-light tracking-wider", 
                variant === "white" ? "text-white" : "text-black"
              )}>RHAI</span>
            )}
          </>
        )}
      </div>
    </Link>
  );
};

export default Logo;
