
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

// Sample data
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
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    icon: FileText,
    status: "completed" as const
  },
  {
    id: "hist2",
    title: "Generated product images",
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    icon: Image,
    status: "completed" as const
  },
  {
    id: "hist3",
    title: "Code refactoring assistant",
    timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    icon: Code,
    status: "failed" as const
  },
  {
    id: "hist4",
    title: "Customer support chat analysis",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: MessageSquare,
    status: "completed" as const
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation/header bar */}
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
        {/* Search/Chat section */}
        <section className="mb-10">
          <SearchChat />
        </section>
        
        {/* Workflows section */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    title={workflow.title}
                    description={workflow.description}
                    icon={workflow.icon}
                    onClick={() => console.log(`Workflow clicked: ${workflow.id}`)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {workflows.slice(0, 3).map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    title={workflow.title}
                    description={workflow.description}
                    icon={workflow.icon}
                    onClick={() => console.log(`Workflow clicked: ${workflow.id}`)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="favorites" className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {workflows.slice(0, 2).map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    title={workflow.title}
                    description={workflow.description}
                    icon={workflow.icon}
                    onClick={() => console.log(`Workflow clicked: ${workflow.id}`)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>
        
        {/* History section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">Recent History</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border">
            {historyItems.map((item) => (
              <HistoryItem
                key={item.id}
                title={item.title}
                timestamp={item.timestamp}
                icon={item.icon}
                status={item.status}
                onClick={() => console.log(`History item clicked: ${item.id}`)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
