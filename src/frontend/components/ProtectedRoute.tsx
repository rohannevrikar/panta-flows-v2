
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/frontend/contexts/AuthContext";
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
    // Check if user is authenticated but no longer valid
    const checkAuthValidity = () => {
      if (!user && isAuthenticated) {
        toast.error("Your session has expired. Please login again.");
        navigate(redirectTo);
      }
    };
    
    if (!loading) {
      checkAuthValidity();
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
