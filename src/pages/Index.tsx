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

interface Workflow {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
}

const workflows: Workflow[] = [
  {
    id: "chat",
    title: "Chat Assistant",
    description: "General purpose AI chat assistant",
    icon: MessageSquare
  },
  {
    id: "code",
    title: "Code Helper",
    description: "Generate and explain code",
    icon: Code
  },
  {
    id: "image",
    title: "Image Creator",
    description: "Create images from text descriptions",
    icon: Image
  },
  {
    id: "doc",
    title: "Document Helper",
    description: "Summarize and extract from documents",
    icon: FileText
  },
  {
    id: "video",
    title: "Video Generator",
    description: "Create videos from text prompts",
    icon: Video
  },
  {
    id: "music",
    title: "Music Composer",
    description: "Generate music and audio",
    icon: Music
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
  const [activeTab, setActiveTab] = useState("all");
  const [showChat, setShowChat] = useState(false);
  const [historyData, setHistoryData] = useState(historyItems);
  const [sliderValue, setSliderValue] = useState([50]);
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>(workflows);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  
  const handleSearchSubmit = (text: string, files: File[]) => {
    setCurrentWorkflow({
      id: "chat",
      title: "Chat Assistant",
      description: "General purpose AI chat assistant",
      icon: MessageSquare
    });
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setCurrentWorkflow(null);
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
      color: workflowData.iconColor
    };

    setAvailableWorkflows(prev => [...prev, newWorkflow]);
    toast.success("New workflow created successfully!");
  };

  const handleWorkflowClick = (workflow: Workflow) => {
    setCurrentWorkflow(workflow);
    setShowChat(true);
  };

  useEffect(() => {
    setShowChat(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {showChat ? (
        <ChatInterface 
          onClose={handleCloseChat} 
          workflowTitle={currentWorkflow?.title} 
          userName="Moin Arian"
        />
      ) : (
        <>
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
                  <h2 className="text-xl font-medium text-white">Workflows</h2>
                  <Button 
                    variant="outline" 
                    className="gap-1 hover:bg-black hover:text-white bg-white/20 backdrop-blur-sm text-white border-white/30"
                    onClick={() => setShowNewWorkflowDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    New Workflow
                  </Button>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6 bg-white/20 backdrop-blur-sm">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-black text-white">All</TabsTrigger>
                    <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:text-black text-white">Recent</TabsTrigger>
                    <TabsTrigger value="favorites" className="data-[state=active]:bg-white data-[state=active]:text-black text-white">Favorites</TabsTrigger>
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
                          onClick={() => handleWorkflowClick(workflow)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-8 bg-white/20 backdrop-blur-sm p-6 rounded-lg border border-white/30 text-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <SlidersHorizontal size={20} className="text-white" />
                    <h3 className="font-medium">Workflow Settings</h3>
                  </div>
                  <p className="text-sm text-white/80 mb-4">Adjust the creativity level for your workflows</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Conservative</span>
                    <Slider 
                      className="flex-1"
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                    />
                    <span className="text-sm">Creative</span>
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
                  <h2 className="text-xl font-medium text-gray-800">Recent History</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-gray-100 text-gray-700"
                    onClick={() => navigate("/history")}
                  >
                    View All
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {historyData.map((item) => (
                    <HistoryItem
                      key={item.id}
                      title={item.title}
                      workflowType={item.workflowType}
                      timestamp={item.timestamp}
                      icon={item.icon}
                      status={item.status}
                      isFavorite={item.isFavorite}
                      onClick={() => {
                        console.log(`History item clicked: ${item.id}`);
                        setCurrentWorkflow({
                          id: item.id,
                          title: item.workflowType,
                          description: item.title,
                          icon: item.icon
                        });
                        setShowChat(true);
                      }}
                      onFavoriteToggle={() => toggleFavorite(item.id)}
                      onRename={(newName) => renameHistoryItem(item.id, newName)}
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
        </>
      )}
    </div>
  );
};

export default Index;
