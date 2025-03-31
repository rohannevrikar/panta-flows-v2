
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="h-10 w-10 rounded-md bg-gradient-to-r from-panta-blue to-panta-orange flex items-center justify-center text-white font-bold text-xl mr-2">
        P
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg text-gray-900">PANTA</span>
        <span className="text-sm text-gray-600">Flows</span>
      </div>
    </div>
  );
};

export default Logo;
