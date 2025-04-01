
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star, History as HistoryIcon, Settings as SettingsIcon, ChevronDown, Users, Search } from 'lucide-react';
import { useTheme } from '@/frontend/contexts/ThemeContext';
import { useLanguage } from '@/frontend/contexts/LanguageContext';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { getClientWorkflows } from '@/frontend/lib/client-themes';
import { Button } from '@/frontend/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/frontend/components/ui/tabs';
import ProfileDropdown from '@/frontend/components/ProfileDropdown';
import SearchChat from '@/frontend/components/SearchChat';
import WorkflowCard from '@/frontend/components/WorkflowCard';
import HistoryItem from '@/frontend/components/HistoryItem';
import Logo from '@/frontend/components/Logo';
import ChatInterface from '@/frontend/components/ChatInterface';
import { Slider } from '@/frontend/components/ui/slider';
import NewWorkflowDialog from '@/frontend/components/NewWorkflowDialog';
import { toast } from 'sonner';
import { useMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { historyService } from '@/frontend/services/historyService';
import { workflowService } from '@/frontend/services/workflowService';
import LanguageSelector from '@/frontend/components/LanguageSelector';

const Index = () => {
  const navigate = useNavigate();
  const { theme, clientId } = useTheme();
  const { user } = useAuth();
  const { translate } = useLanguage();
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('workflows');
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false);
  
  // Get client workflows configuration
  const workflows = getClientWorkflows(clientId);

  // Mock recent items data
  const recentItems = [
    { 
      id: '1', 
      title: 'Logo Design For Tech Startup',
      workflowType: 'Design Inspiration',
      timestamp: '2 hours ago',
      icon: 'Palette',
      status: 'completed',
      isFavorite: true,
    },
    { 
      id: '2', 
      title: 'Analytics Dashboard Wireframe',
      workflowType: 'UI/UX Workflow',
      timestamp: 'Yesterday',
      icon: 'BarChart2',
      status: 'processing',
      isFavorite: false,
    },
    { 
      id: '3', 
      title: 'Product Mockup Generation',
      workflowType: 'Image Generation',
      timestamp: '3 days ago',
      icon: 'Image',
      status: 'failed',
      isFavorite: true,
    },
  ];

  const handleFavoriteToggle = (itemId) => {
    toast.success(`Item ${itemId} ${recentItems.find(item => item.id === itemId)?.isFavorite ? 'removed from' : 'added to'} favorites`);
  };
  
  const handleCreateWorkflow = (type) => {
    toast.success(`Created a new ${type} workflow`);
    setNewWorkflowOpen(false);
    navigate('/chat', { state: { workflowType: type } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Logo />
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                <Button
                  variant="ghost"
                  className={`text-sm font-medium ${activeTab === 'workflows' ? 'bg-gray-100' : ''}`}
                  onClick={() => setActiveTab('workflows')}
                >
                  {translate('dashboard.workflows')}
                </Button>
                <Button
                  variant="ghost"
                  className={`text-sm font-medium ${activeTab === 'recent' ? 'bg-gray-100' : ''}`}
                  onClick={() => setActiveTab('recent')}
                >
                  {translate('dashboard.recent')}
                </Button>
                <Button
                  variant="ghost"
                  className="text-sm font-medium"
                  onClick={() => navigate('/history')}
                >
                  <HistoryIcon className="h-4 w-4 mr-2" />
                  {translate('dashboard.history')}
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-3">
              <SearchChat />
              <LanguageSelector />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Mobile Tabs */}
        <div className="md:hidden mb-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="workflows">{translate('dashboard.workflows')}</TabsTrigger>
              <TabsTrigger value="recent">{translate('dashboard.recent')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {activeTab === 'workflows' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{translate('dashboard.availableWorkflows')}</h1>
              <Button onClick={() => setNewWorkflowOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {translate('dashboard.newWorkflow')}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  title={workflow.title}
                  description={workflow.description}
                  icon={workflow.iconName}
                  color={workflow.color}
                  onClick={() => navigate('/chat', { state: { workflowType: workflow.title } })}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{translate('dashboard.recentActivities')}</h1>
              <Button variant="outline" onClick={() => navigate('/history')}>
                <HistoryIcon className="h-4 w-4 mr-2" />
                {translate('dashboard.viewAllHistory')}
              </Button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {recentItems.map((item) => (
                <HistoryItem
                  key={item.id}
                  title={item.title}
                  workflowType={item.workflowType}
                  timestamp={item.timestamp}
                  icon={item.icon}
                  status={item.status}
                  isFavorite={item.isFavorite}
                  onClick={() => navigate(`/chat?history=${item.id}`)}
                  onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                  onRename={() => toast.info(`Rename dialog for ${item.title}`)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* New Workflow Dialog */}
      <NewWorkflowDialog 
        open={newWorkflowOpen} 
        onOpenChange={setNewWorkflowOpen}
        onCreateWorkflow={handleCreateWorkflow}
        workflows={workflows}
      />
    </div>
  );
};

export default Index;
