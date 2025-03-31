
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <img src="/lovable-uploads/0c9f0369-7790-4186-ac9f-7338379e785f.png" alt="PANTA Logo" className="h-10 mr-2" />
      <div className="flex flex-col">
        <span className="font-bold text-lg text-gray-900">PANTA</span>
        <span className="text-sm text-gray-600">Flows</span>
      </div>
    </div>
  );
};

export default Logo;
