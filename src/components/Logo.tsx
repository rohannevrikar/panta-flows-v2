
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  onClick?: () => void;
}

const Logo = ({ className, variant = "default", onClick }: LogoProps) => {
  return (
    <Link to="/dashboard" className="no-underline">
      <div 
        onClick={onClick} 
        className={cn("font-bold text-xl flex items-center cursor-pointer", className)}
      >
        <img 
          src="/panta-logo.png" 
          alt="Panta Logo" 
          className="h-8 mr-2" 
        />
        <span className={cn(
          "mr-1", 
          variant === "white" ? "text-white" : "text-panta-blue"
        )}>PANTA</span>
        <span className={cn(
          "font-light", 
          variant === "white" ? "text-white" : "text-panta-orange"
        )}>flows</span>
      </div>
    </Link>
  );
};

export default Logo;
