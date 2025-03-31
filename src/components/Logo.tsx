
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
}

const Logo = ({ className, variant = "default" }: LogoProps) => {
  return (
    <Link to="/dashboard" className="no-underline">
      <div className={cn("font-bold text-xl flex items-center", className)}>
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
