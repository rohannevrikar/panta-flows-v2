
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const Login = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would authenticate with a backend
    if (email && password) {
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      // Simulate loading
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      toast({
        title: "Login failed",
        description: "Please enter your email and password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section */}
      <div 
        className="w-full lg:w-3/5 flex flex-col p-8 md:p-16 justify-center relative overflow-hidden"
        style={{ 
          backgroundColor: theme.primaryColor,
          background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.accentColor} 100%)` 
        }}
      >
        <div className="absolute top-8 left-8">
          <Logo className="text-white" />
        </div>

        <div className="mt-24 lg:mt-0 z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            {theme.tagline || "discover designInspiration"}
          </h1>
          
          <p className="text-white/80 text-xl md:text-2xl max-w-lg mt-6">
            Unleash your creativity with AI-powered workflows designed for modern teams
          </p>

          {/* Sample "prompt tag" with rounded background */}
          <div className="mt-8">
            <div className="inline-flex items-center px-4 py-3 bg-black/20 backdrop-blur-sm rounded-full text-white">
              <span className="text-sm mr-2">+</span>
              <span>kostengünstiges ufo für musikvideo</span>
            </div>
          </div>
        </div>

        {/* Decorative large logo in background */}
        <div className="absolute right-[-100px] bottom-[-100px] opacity-10">
          <img 
            src={theme.logo || "/panta-logo.png"} 
            alt="Background Logo" 
            className="w-[500px] h-[500px]" 
          />
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center items-center p-8">
        <Card className="w-full max-w-md p-6 border-none shadow-none">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Willkommen zurück!</h2>
            <h1 className="text-4xl font-bold mt-2 mb-8">Log dich ein</h1>
          </div>

          <CardContent className="p-0">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Passwort</Label>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-10"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="text-right">
                  <a href="#" className="text-sm text-gray-500 hover:underline">
                    Passwort vergessen?
                  </a>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Einloggen
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">oder</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12"
              >
                <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_24dp.png" 
                     alt="Google" 
                     className="h-5 mr-2" />
                Mit Google anmelden
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
