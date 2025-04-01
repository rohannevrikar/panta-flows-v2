
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = "/login" 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if token is expired or invalid
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          // This is a simple check - could be enhanced with JWT expiry checks
          if (!user) {
            toast.error("Your session has expired. Please login again.");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_info");
            navigate(redirectTo);
          }
        } catch (error) {
          console.error("Token validation error:", error);
        }
      }
    };
    
    if (!loading && isAuthenticated) {
      checkTokenValidity();
    }
  }, [isAuthenticated, loading, navigate, redirectTo, user]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
