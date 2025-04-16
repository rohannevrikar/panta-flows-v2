import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  onClick?: () => void;
  small?: boolean;
}

const Logo = ({ className, variant = "default", onClick, small = false }: LogoProps) => {
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
          src="/panta-logo.png" 
          alt="Panta Logo" 
          className={cn(
            "object-contain",
            small ? "h-8 w-8" : "h-12 w-12"
          )} 
        />
        {!small && (
          <>
            <span className={cn(
              "mr-1 tracking-wider", 
              variant === "white" ? "text-white" : "text-black"
            )}>PANTA</span>
            <span className={cn(
              "font-light tracking-wider", 
              variant === "white" ? "text-white" : "text-black"
            )}>RHAI</span>
          </>
        )}
      </div>
    </Link>
  );
};

export default Logo;
