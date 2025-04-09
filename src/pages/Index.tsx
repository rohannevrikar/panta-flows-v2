import { useState, useEffect } from "react";
import { 
  Bot, 
  Code, 
  FileText, 
  Image, 
  MessageSquare, 
  Music, 
  Plus, 
  Video,
  SlidersHorizontal,
  History,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileDropdown from "@/components/ProfileDropdown";
import SearchChat from "@/components/SearchChat";
import WorkflowCard from "@/components/WorkflowCard";
import HistoryItem from "@/components/HistoryItem";
import Logo from "@/components/Logo";
import ChatInterface from "@/components/ChatInterface";
import { Slider } from "@/components/ui/slider";
import NewWorkflowDialog from "@/components/NewWorkflowDialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { apiService, ChatSession } from "@/lib/api-service";

interface HistoryItemSession extends ChatSession {
  isFavorite?: boolean;
}

interface Workflow {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  translationKey?: string;
  systemPrompt?: string;
  conversationStarters?: { id: string; text: string }[];
}

const workflows: Workflow[] = [
  {
    id: "chat",
    title: "Chat Assistant",
    description: "General purpose AI chat assistant",
    icon: MessageSquare,
    translationKey: "chatAssistant"
  },
  {
    id: "code",
    title: "Code Helper",
    description: "Generate and explain code",
    icon: Code,
    translationKey: "codeHelper"
  },
  {
    id: "image",
    title: "Image Creator",
    description: "Create images from text descriptions",
    icon: Image,
    translationKey: "imageCreator"
  },
  {
    id: "doc",
    title: "Document Helper",
    description: "Summarize and extract from documents",
    icon: FileText,
    translationKey: "documentHelper"
  },
  {
    id: "video",
    title: "Video Generator",
    description: "Create videos from text prompts",
    icon: Video,
    translationKey: "videoGenerator"
  },
  {
    id: "music",
    title: "Music Composer",
    description: "Generate music and audio",
    icon: Music,
    translationKey: "musicComposer"
  },
];

const historyItems = [
  {
    id: "hist1",
    title: "Summarized quarterly report",
    workflowType: "Document Helper",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: FileText,
    status: "completed" as const,
    isFavorite: false
  },
  {
    id: "hist2",
    title: "Generated product images",
    workflowType: "Image Creator",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    icon: Image,
    status: "completed" as const,
    isFavorite: true
  },
  {
    id: "hist3",
    title: "Code refactoring assistant",
    workflowType: "Code Helper",
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    icon: Code,
    status: "failed" as const,
    isFavorite: false
  },
  {
    id: "hist4",
    title: "Customer support chat analysis",
    workflowType: "Chat Assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    icon: MessageSquare,
    status: "completed" as const,
    isFavorite: false
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [historyData, setHistoryData] = useState<HistoryItemSession[]>([]);
  const [sliderValue, setSliderValue] = useState([50]);
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>(workflows);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [showChat, setShowChat] = useState(false);
  
  const handleSearchSubmit = (text: string, files: File[]) => {
    // Navigate to chat with search query and replace the current history entry
    navigate(`/chat?workflowId=chat&query=${encodeURIComponent(text)}`, { replace: true });
  };

  const toggleFavorite = (id: string) => {
    setHistoryData(prev =>
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const renameHistoryItem = (id: string, newTitle: string) => {
    setHistoryData(prev =>
      prev.map(item => 
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  };

  const handleCreateWorkflow = (workflowData: any) => {
    const iconMap: Record<string, LucideIcon> = {
      "Chat": MessageSquare,
      "Code": Code,
      "Image": Image,
      "Document": FileText,
      "Video": Video,
      "Music": Music,
      "Bot": Bot
    };

    const iconComponent = iconMap[workflowData.selectedIcon] || MessageSquare;

    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      title: workflowData.title,
      description: workflowData.description,
      icon: iconComponent,
      color: workflowData.iconColor,
      systemPrompt: workflowData.systemPrompt,
      conversationStarters: workflowData.starters.map((text: string, index: number) => ({
        id: `starter-${index}`,
        text
      }))
    };

    setAvailableWorkflows(prev => [...prev, newWorkflow]);
    toast.success("New workflow created successfully!");
  };

  const handleWorkflowClick = (workflow: Workflow) => {
    setCurrentWorkflow(workflow);
    // Navigate to chat with workflowId and replace the current history entry
    navigate(`/chat?workflowId=${workflow.id}`, { replace: true });
  };

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await apiService.getChatHistory('default-user', 5); // Load last 5 sessions
        // Add isFavorite property to each session
        const historyWithFavorites = history.map(session => ({
          ...session,
          isFavorite: false
        }));
        setHistoryData(historyWithFavorites);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    loadHistory();
  }, []);

  // Update history item click handler
  const handleHistoryItemClick = (session: HistoryItemSession) => {
    // Navigate to chat with sessionId and replace the current history entry
    navigate(`/chat?sessionId=${session.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-black hover:text-white"
              onClick={() => navigate("/history")}
            >
              <History className="h-5 w-5" />
            </Button>
            <LanguageSelector />
            <ProfileDropdown 
              name="Moin Arian" 
              email="moin@example.com"
            />
          </div>
        </div>
      </header>
      
      <div className="py-8" style={{ 
        background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.accentColor} 100%)`,
      }}>
        <div className="container mx-auto px-4">
          <section className="mb-10">
            <SearchChat 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleSearchSubmit}
              disableNavigation={true}
            />
          </section>
          
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white">{translate('dashboard.workflows')}</h2>
              <Button 
                variant="outline" 
                className="gap-1 hover:bg-black hover:text-white bg-white/20 backdrop-blur-sm text-white border-white/30"
                onClick={() => setShowNewWorkflowDialog(true)}
              >
                <Plus className="h-4 w-4" />
                {translate('dashboard.newWorkflow')}
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-white/20 backdrop-blur-sm">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-black text-white">
                  {translate('dashboard.all')}
                </TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:text-black text-white">
                  {translate('dashboard.recent')}
                </TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-white data-[state=active]:text-black text-white">
                  {translate('dashboard.favorites')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {availableWorkflows.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      title={workflow.title}
                      description={workflow.description}
                      icon={workflow.icon}
                      color={workflow.color}
                      translationKey={workflow.translationKey}
                      onClick={() => handleWorkflowClick(workflow)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="recent" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {workflows.slice(0, 3).map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      title={workflow.title}
                      description={workflow.description}
                      icon={workflow.icon}
                      translationKey={workflow.translationKey}
                      onClick={() => handleWorkflowClick(workflow)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="favorites" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {workflows.slice(0, 2).map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      title={workflow.title}
                      description={workflow.description}
                      icon={workflow.icon}
                      translationKey={workflow.translationKey}
                      onClick={() => handleWorkflowClick(workflow)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 bg-white/20 backdrop-blur-sm p-6 rounded-lg border border-white/30 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <SlidersHorizontal size={20} className="text-white" />
                <h3 className="font-medium">{translate('dashboard.workflowSettings')}</h3>
              </div>
              <p className="text-sm text-white/80 mb-4">{translate('dashboard.creativityLevel')}</p>
              <div className="flex items-center gap-4">
                <span className="text-sm">{translate('dashboard.conservative')}</span>
                <Slider 
                  className="flex-1"
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                />
                <span className="text-sm">{translate('dashboard.creative')}</span>
              </div>
              <div className="text-center mt-1">
                <span className="text-xs text-white/80">{sliderValue[0]}%</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <div className="py-8 bg-white flex-1">
        <div className="container mx-auto px-4">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-800">{translate('dashboard.recentHistory')}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-gray-100 text-gray-700"
                onClick={() => navigate("/history")}
              >
                {translate('app.viewAll')}
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {historyData.map((session) => (
                <HistoryItem
                  key={session.id}
                  title={session.workflowTitle}
                  workflowType={session.workflowId}
                  timestamp={new Date(session.updatedAt)}
                  icon={MessageSquare}
                  status="completed"
                  isFavorite={false}
                  onClick={() => handleHistoryItemClick(session)}
                  onFavoriteToggle={() => {}} // Implement if needed
                  onRename={() => {}} // Implement if needed
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <NewWorkflowDialog
        open={showNewWorkflowDialog}
        onClose={() => setShowNewWorkflowDialog(false)}
        onCreateWorkflow={handleCreateWorkflow}
      />
    </div>
  );
};

export default Index;
