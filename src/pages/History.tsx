import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Image, 
  Code, 
  MessageSquare,
  Search,
  ArrowLeft,
  LucideIcon
} from "lucide-react";
import HistoryItem from "@/components/HistoryItem";
import ProfileDropdown from "@/components/ProfileDropdown";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { apiService, ChatSession } from "@/lib/api-service";

interface HistoryItemSession extends ChatSession {
  isFavorite?: boolean;
  workflowTitle?: string;
  workflowColor?: string;
  updatedAt?: string;
}

interface FrontendWorkflow {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  systemPrompt?: string;
  conversationStarters?: { id: string; text: string }[];
}

const iconMap: Record<string, LucideIcon> = {
  "Chat": MessageSquare,
  "Code": Code,
  "Image": Image,
  "Document": FileText,
  "Video": MessageSquare,
  "Music": MessageSquare,
  "Bot": MessageSquare
};

const History = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<HistoryItemSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowIcons, setWorkflowIcons] = useState<Record<string, LucideIcon>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const history = await apiService.getChatSessions();
      console.log('Total history items:', history.length); // Debug log
      
      // Sort by date but don't limit the number of items
      const sortedHistory = history
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(session => ({
          id: session.id,
          title: session.workflowTitle || 'Untitled Workflow',
          created_at: new Date(session.createdAt),
          workflow_id: session.workflowId,
          workflowColor: '#3B82F6', // Default color
          isFavorite: false,
          updatedAt: session.updatedAt,
          messages: session.messages || []
        }));

      console.log('Sorted history items:', sortedHistory.length); // Debug log
      setSessions(sortedHistory);

      // Only fetch icons for unique workflow IDs
      const uniqueWorkflowIds = [...new Set(sortedHistory.map(session => session.workflow_id).filter(Boolean))];
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
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSelect = (session: ChatSession & { workflowColor?: string }) => {
    navigate(`/chat?sessionId=${session.id}&workflowId=${session.workflow_id}&color=${encodeURIComponent(session.workflowColor || '#3B82F6')}`);
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await apiService.deleteSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Chat session deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete chat session');
    }
  };

  const handleHistoryItemClick = async (session: HistoryItemSession) => {
    try {
      console.log('1. Starting handleHistoryItemClick with session:', {
        id: session.id,
        workflow_id: session.workflow_id,
        messages: session.messages?.length || 0
      });
      
      // Get the session data which includes messages
      const sessionData = await apiService.getSession(session.id, 'default-user');
      console.log('2. Session data from getSession:', {
        id: sessionData.id,
        messages: sessionData.messages?.length || 0,
        messages: sessionData.messages
      });
      
      // Check if session exists
      if (!sessionData) {
        toast.error('Chat session not found');
        return;
      }

      // Get workflow config for the session
      const config = await apiService.getWorkflowConfig(session.workflow_id || '');
      console.log('3. Workflow config:', config);
      
      // Convert API config to frontend workflow format
      const frontendWorkflow: FrontendWorkflow = {
        id: session.workflow_id || '',
        title: config.title || '',
        description: config.description || '',
        icon: iconMap[config.icon_name] || MessageSquare,
        color: config.color || '#3B82F6',
        systemPrompt: config.system_prompt || '',
        conversationStarters: config.conversation_starters || []
      };

      // Include all necessary parameters in the URL
      const url = `/chat?sessionId=${session.id}&workflowId=${session.workflow_id}&title=${encodeURIComponent(frontendWorkflow.title)}&systemPrompt=${encodeURIComponent(frontendWorkflow.systemPrompt || '')}&starters=${encodeURIComponent(JSON.stringify(frontendWorkflow.conversationStarters || []))}&color=${encodeURIComponent(frontendWorkflow.color)}`;
      
      console.log('4. Navigating to URL:', url);
      // Navigate to chat with session data
      navigate(url);
      
      console.log('5. Navigation successful');
    } catch (error) {
      console.error('Error in handleHistoryItemClick:', error);
      toast.error('Failed to load chat session. Please try again.');
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ProfileDropdown 
              name="Moin Arian" 
              email="moin@example.com"
            />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No history items found</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <HistoryItem
                key={session.id}
                session={session}
                onSelect={handleHistoryItemClick}
                onDelete={handleDelete}
                workflowIcon={session.workflow_id ? workflowIcons[session.workflow_id] : MessageSquare}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
