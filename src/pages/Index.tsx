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
import { WorkflowDialog } from "@/components/WorkflowDialog";

interface HistoryItemSession extends ChatSession {
  isFavorite?: boolean;
  workflowTitle?: string;
  workflowColor?: string;
  updatedAt?: string;
  systemPrompt?: string;
  conversationStarters?: string[];
}

// Frontend Workflow interface
interface FrontendWorkflow {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  translationKey?: string;
  systemPrompt?: string;
  conversationStarters?: { id: string; text: string }[];
  created_at?: string;
}

interface WorkflowFormData {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  systemPrompt: string;
  conversationStarters: { id: string; text: string }[];
}

// API Workflow interface
interface ApiWorkflow {
  id: string;
  title: string;
  description: string;
  system_prompt: string;
  icon_name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  conversation_starters: { id: string; text: string }[];
  is_default: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  "Chat": MessageSquare,
  "Code": Code,
  "Image": Image,
  "Document": FileText,
  "Video": Video,
  "Music": Music,
  "Bot": Bot
};

const convertApiToFrontendWorkflow = (apiWorkflow: ApiWorkflow): FrontendWorkflow => {
  return {
    id: apiWorkflow.id,
    title: apiWorkflow.title,
    description: apiWorkflow.description,
    icon: iconMap[apiWorkflow.icon_name] || MessageSquare,
    color: apiWorkflow.color,
    systemPrompt: apiWorkflow.system_prompt,
    conversationStarters: apiWorkflow.conversation_starters,
    created_at: apiWorkflow.created_at
  };
};

const workflows: FrontendWorkflow[] = [
  {
    id: "chat",
    title: "Chat Assistant",
    description: "General purpose AI chat assistant",
    icon: MessageSquare,
    translationKey: "chatAssistant",
    systemPrompt: "You are a helpful AI assistant. Your goal is to provide accurate, helpful, and friendly responses to user queries. You can help with a wide range of topics and tasks."
  },
  {
    id: "code",
    title: "Code Helper",
    description: "Generate and explain code",
    icon: Code,
    translationKey: "codeHelper",
    systemPrompt: "You are an expert programming assistant. Your goal is to help users with coding tasks, including:\n- Writing and explaining code\n- Debugging issues\n- Suggesting best practices\n- Providing code examples\n- Explaining programming concepts\n\nAlways provide clear, well-documented code and explain your reasoning."
  },
  {
    id: "image",
    title: "Image Creator",
    description: "Create images from text descriptions",
    icon: Image,
    translationKey: "imageCreator",
    systemPrompt: "You are an AI image creation assistant. Your goal is to help users create images from text descriptions. You can help with:\n- Generating image prompts\n- Refining image descriptions\n- Suggesting visual styles\n- Providing image composition tips"
  },
  {
    id: "doc",
    title: "Document Helper",
    description: "Summarize and extract from documents",
    icon: FileText,
    translationKey: "documentHelper",
    systemPrompt: "You are a document analysis assistant. Your goal is to help users understand and work with documents by:\n- Summarizing content\n- Extracting key information\n- Analyzing text\n- Identifying important points\n- Providing document insights"
  },
  {
    id: "video",
    title: "Video Generator",
    description: "Create videos from text prompts",
    icon: Video,
    translationKey: "videoGenerator",
    systemPrompt: "You are a video creation assistant. Your goal is to help users create videos by:\n- Generating video scripts\n- Suggesting visual elements\n- Planning video structure\n- Providing production tips\n- Recommending video styles"
  },
  {
    id: "music",
    title: "Music Composer",
    description: "Generate music and audio",
    icon: Music,
    translationKey: "musicComposer",
    systemPrompt: "You are a music composition assistant. Your goal is to help users create music by:\n- Generating musical ideas\n- Suggesting melodies and harmonies\n- Providing composition tips\n- Recommending musical styles\n- Explaining music theory concepts"
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
  const [availableWorkflows, setAvailableWorkflows] = useState<FrontendWorkflow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentWorkflow, setCurrentWorkflow] = useState<FrontendWorkflow | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowColors, setWorkflowColors] = useState<Record<string, string>>({});
  const [workflowIcons, setWorkflowIcons] = useState<Record<string, LucideIcon>>({});
  const [editingWorkflow, setEditingWorkflow] = useState<FrontendWorkflow | null>(null);
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  
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

  // Load workflows from API
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        setIsLoading(true);
        const apiWorkflows = await apiService.getWorkflows('default-user');
        const frontendWorkflows = apiWorkflows.map(convertApiToFrontendWorkflow);
        setAvailableWorkflows(frontendWorkflows);
      } catch (err) {
        console.error('Error loading workflows:', err);
        setError(err instanceof Error ? err.message : 'Failed to load workflows');
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkflows();
  }, []);

  const handleEditWorkflow = async (workflow: FrontendWorkflow) => {
    try {
      console.log('Fetching workflow config for:', workflow.id);
      const config = await apiService.getWorkflowConfig(workflow.id);
      console.log('Fetched workflow config:', config);
      
      if (!config) {
        toast.error('Workflow configuration not found');
        return;
      }
      
      // Convert API config to frontend workflow format
      const frontendWorkflow: FrontendWorkflow = {
        id: workflow.id,
        title: config.title || workflow.title,
        description: config.description || workflow.description,
        icon: iconMap[config.icon_name] || workflow.icon || MessageSquare,
        color: config.color || workflow.color || '#3B82F6',
        systemPrompt: config.system_prompt || workflow.systemPrompt || '',
        conversationStarters: config.conversation_starters || workflow.conversationStarters || [],
        created_at: config.created_at || workflow.created_at
      };
      
      setEditingWorkflow(frontendWorkflow);
      setShowNewWorkflowDialog(true);
      toast.success('Editing workflow');
    } catch (error) {
      console.error('Error fetching workflow config:', error);
      toast.error('Failed to load workflow configuration');
    }
  };

  const handleCreateWorkflow = async (workflowData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingWorkflow) {
        // Get the existing workflow to ensure we have all fields
        const existingWorkflow = await apiService.getWorkflow(editingWorkflow.id, 'default-user');
        
        // Prepare the update data with all required fields
        const updateData = {
          id: existingWorkflow.id,
          title: workflowData.title,
          description: workflowData.description,
          system_prompt: workflowData.systemPrompt || existingWorkflow.system_prompt || "You are a helpful assistant.",
          icon_name: workflowData.selectedIcon,
          color: workflowData.iconColor,
          user_id: 'default-user',
          conversation_starters: workflowData.starters,
          is_default: existingWorkflow.is_default,
          created_at: existingWorkflow.created_at,
          updated_at: new Date().toISOString()
        };
        
        await apiService.updateWorkflow(editingWorkflow.id, updateData, 'default-user');
        toast.success('Workflow updated successfully');
      } else {
        // Create new workflow
        const newApiWorkflow = await apiService.createWorkflow({
          title: workflowData.title,
          description: workflowData.description,
          system_prompt: workflowData.systemPrompt || "You are a helpful assistant.",
          icon_name: workflowData.selectedIcon,
          color: workflowData.iconColor,
          user_id: 'default-user',
          conversation_starters: workflowData.starters,
          is_default: false
        });

        const newFrontendWorkflow = convertApiToFrontendWorkflow(newApiWorkflow);
        setAvailableWorkflows(prev => [...prev, newFrontendWorkflow]);
        toast.success("New workflow created successfully!");
      }

      // Refresh workflows
      const apiWorkflows = await apiService.getWorkflows('default-user');
      const frontendWorkflows = apiWorkflows.map(convertApiToFrontendWorkflow);
      setAvailableWorkflows(frontendWorkflows);
      
      // Close dialog and reset state
      setShowNewWorkflowDialog(false);
      setEditingWorkflow(null);
    } catch (err) {
      console.error('Error saving workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to save workflow');
      toast.error("Failed to save workflow");
    } finally {
      setIsLoading(false);
    }
  };

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await apiService.getChatSessions();
        // Sort by date and take the 6 most recent items
        const recentHistory = history
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)
          .map(session => {
            // Filter out system messages
            const filteredMessages = session.messages.filter(msg => msg.role !== 'system');
            return {
              id: session.id,
              title: session.workflowTitle || 'Untitled Workflow',
              created_at: new Date(session.createdAt),
              workflow_id: session.workflowId,
              workflowColor: '#3B82F6', // Default color
              isFavorite: false,
              updatedAt: session.updatedAt,
              messages: filteredMessages // Include filtered messages
            } as HistoryItemSession;
          });

        setHistoryData(recentHistory);

        // Only fetch icons for unique workflow IDs
        const uniqueWorkflowIds = [...new Set(recentHistory.map(session => session.workflow_id).filter(Boolean))];
        const icons: Record<string, LucideIcon> = {};
        
        for (const workflowId of uniqueWorkflowIds) {
          try {
            const config = await apiService.getWorkflowConfig(workflowId);
            if (config?.icon_name) {
              icons[workflowId] = iconMap[config.icon_name] || MessageSquare;
            }
          } catch (err) {
            console.error(`Failed to fetch workflow config for ${workflowId}:`, err);
            // Use default icon if config fetch fails
            icons[workflowId] = MessageSquare;
          }
        }
        setWorkflowIcons(icons);
      } catch (error) {
        console.error('Error loading history:', error);
        setHistoryData([]);
      }
    };
    loadHistory();
  }, []);

  const handleDelete = async (sessionId: string) => {
    try {
      await apiService.deleteSession(sessionId);
      setHistoryData(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const handleHistoryItemClick = async (session: ChatSession) => {
    try {
      console.log('Loading session:', session);
      
      // Get the session data which includes messages
      const sessionData = await apiService.getSession(session.id, 'default-user');
      console.log('Session data:', sessionData);
      
      // Check if session exists
      if (!sessionData) {
        toast.error('Chat session not found');
        return;
      }

      // Get workflow config for the session
      const config = await apiService.getWorkflowConfig(session.workflow_id || '');
      console.log('Workflow config:', config);
      
      // Convert API config to frontend workflow format
      const frontendWorkflow: FrontendWorkflow = {
        id: session.workflow_id || '',
        title: config.title || '',
        description: config.description || '',
        icon: iconMap[config.icon_name] || MessageSquare,
        color: config.color || '#3B82F6',
        systemPrompt: config.system_prompt || '',
        conversationStarters: config.conversation_starters || [],
        created_at: session.created_at
      };

      // Include all necessary parameters in the URL
      const url = `/chat?sessionId=${session.id}&workflowId=${session.workflow_id}&title=${encodeURIComponent(frontendWorkflow.title)}&systemPrompt=${encodeURIComponent(frontendWorkflow.systemPrompt || '')}&starters=${encodeURIComponent(JSON.stringify(frontendWorkflow.conversationStarters || []))}&color=${encodeURIComponent(frontendWorkflow.color)}`;
      
      // Set the current workflow and show chat
      setCurrentWorkflow(frontendWorkflow);
      setShowChat(true);
      navigate(url);
      
      console.log('Navigation successful to URL:', url);
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast.error('Failed to load chat session. Please try again.');
    }
  };

  const handleWorkflowClick = async (workflow: FrontendWorkflow) => {
    try {
      console.log('Workflow clicked:', workflow);
      setIsLoading(true);
      
      // Create a new session first
      const newSession = await apiService.createSession({
        workflowId: workflow.id,
        title: workflow.title,
        workflowTitle: workflow.title,
        userId: 'default-user',
        messages: []
      });

      console.log('New session created:', newSession);
      
      // Navigate to chat with sessionId, workflowId, and workflow data
      const url = `/chat?sessionId=${newSession.id}&workflowId=${workflow.id}&title=${encodeURIComponent(workflow.title)}&systemPrompt=${encodeURIComponent(workflow.systemPrompt || '')}&starters=${encodeURIComponent(JSON.stringify(workflow.conversationStarters || []))}&color=${encodeURIComponent(workflow.color || '#3B82F6')}`;
      console.log('Navigating to URL:', url);
      
      setCurrentWorkflow(workflow);
      setShowChat(true);
      navigate(url, { replace: true });
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to start chat session');
    } finally {
      setIsLoading(false);
    }
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
              onSearch={(query) => handleSearchSubmit(query, [])}
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
                      onEdit={() => handleEditWorkflow(workflow)}
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
                      onEdit={() => handleEditWorkflow(workflow)}
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
                      onEdit={() => handleEditWorkflow(workflow)}
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
                  session={session}
                  onSelect={handleHistoryItemClick}
                  onDelete={handleDelete}
                  workflowIcon={session.workflow_id ? (workflowIcons[session.workflow_id] || MessageSquare) : MessageSquare}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <NewWorkflowDialog
        open={showNewWorkflowDialog}
        onClose={() => {
          setShowNewWorkflowDialog(false);
          setEditingWorkflow(null);
        }}
        onCreateWorkflow={handleCreateWorkflow}
        workflow={editingWorkflow}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default Index;
