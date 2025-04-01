
import { useState, FormEvent } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { getClientConfig } from "@/lib/client-themes";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { theme, clientId } = useTheme();
  const clientConfig = getClientConfig(clientId);
  const { login, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred during login");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      await loginWithGoogle();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred during Google login");
      }
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Hero Section */}
      <div 
        className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 justify-center relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.accentColor} 100%)` 
        }}
      >
        <div className="absolute top-8 left-8">
          <Logo className="text-white" variant="white" />
        </div>

        <div className="mt-24 lg:mt-0 z-10 max-w-lg">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {theme.tagline || "discover designInspiration"}
          </h1>
          
          <p className="text-white/90 text-xl max-w-md mt-4 leading-relaxed">
            {clientConfig.landingPageText || "Unleash your creativity with AI-powered workflows designed for modern teams"}
          </p>

          {/* Modern "prompt tag" design */}
          <div className="mt-12 flex flex-wrap gap-3">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
              <span className="mr-2">+</span>
              <span>kostengünstiges ufo für musikvideo</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
              <span className="mr-2">+</span>
              <span>logo re-design modern</span>
            </div>
          </div>
        </div>

        {/* Modern background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-[-5%] bottom-[-5%] w-1/2 h-1/2 rounded-full bg-white/20"></div>
          <div className="absolute left-[-10%] top-[30%] w-1/3 h-1/3 rounded-full bg-white/10"></div>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50">
        <Card className="w-full max-w-md p-8 border shadow-lg bg-white rounded-xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-medium text-gray-600">Willkommen zurück!</h2>
            <h1 className="text-3xl font-bold mt-2 mb-2" 
              style={{ color: theme.primaryColor }}>Log dich ein</h1>
          </div>

          <CardContent className="p-0">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
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
                  disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-3 text-gray-500"
                    disabled={isLoading}
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
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Einloggen"}
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
                onClick={handleGoogleLogin}
                disabled={isLoading}
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
