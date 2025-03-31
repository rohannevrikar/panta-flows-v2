import { useState } from "react";
import { 
  Bot, 
  Code, 
  FileText, 
  Image, 
  MessageSquare, 
  Music, 
  Plus, 
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileDropdown from "@/components/ProfileDropdown";
import SearchChat from "@/components/SearchChat";
import WorkflowCard from "@/components/WorkflowCard";
import HistoryItem from "@/components/HistoryItem";
import Logo from "@/components/Logo";
import ChatInterface from "@/components/ChatInterface";

const workflows = [
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
  const [activeTab, setActiveTab] = useState("all");
  const [showChat, setShowChat] = useState(false);
  const [historyData, setHistoryData] = useState(historyItems);
  
  const handleSearchFocus = () => {
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
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
  
  useState(() => {
    setShowChat(false);
  });
  
  const getWorkflowsByRow = (workflows: typeof workflows) => {
    const rows = [];
    for (let i = 0; i < workflows.length; i += 2) {
      rows.push(workflows.slice(i, i + 2));
    }
    return rows;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showChat ? (
        <ChatInterface onClose={handleCloseChat} />
      ) : (
        <>
          <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Logo />
              
              <div className="text-xl font-medium panta-gradient-text">Moin Arian</div>
              
              <ProfileDropdown 
                name="Moin Arian" 
                email="moin@example.com"
              />
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8">
            <section className="mb-10">
              <SearchChat onFocus={handleSearchFocus} autoFocus={false} />
            </section>
            
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Workflows</h2>
                <Button variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" />
                  New Workflow
                </Button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {workflows.map((workflow) => (
                      <WorkflowCard
                        key={workflow.id}
                        title={workflow.title}
                        description={workflow.description}
                        icon={workflow.icon}
                        onClick={() => {
                          console.log(`Workflow clicked: ${workflow.id}`);
                          setShowChat(true);
                        }}
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
                        onClick={() => {
                          console.log(`Workflow clicked: ${workflow.id}`);
                          setShowChat(true);
                        }}
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
                        onClick={() => {
                          console.log(`Workflow clicked: ${workflow.id}`);
                          setShowChat(true);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </section>
            
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Recent History</h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border">
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
                      setShowChat(true);
                    }}
                    onFavoriteToggle={() => toggleFavorite(item.id)}
                    onRename={(newName) => renameHistoryItem(item.id, newName)}
                  />
                ))}
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  );
};

export default Index;
