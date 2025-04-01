
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/frontend/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '@/frontend/contexts/LanguageContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { translate } = useLanguage();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full px-6 py-12 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          {translate('errors.pageNotFound')}
        </h2>
        <p className="text-gray-600 mb-8">
          {translate('errors.pageNotFoundDescription')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            {translate('common.goBack')}
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <Home size={16} />
            {translate('common.dashboard')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
