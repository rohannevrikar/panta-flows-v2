
import React from 'react';
import { Button } from '@/frontend/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 max-w-md">
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <FileQuestion className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
