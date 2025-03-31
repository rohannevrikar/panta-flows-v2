
import { useState } from "react";
import { Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchChat = () => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Handle search/chat submission
    console.log("Search or chat:", query);
    setQuery("");
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative w-full max-w-3xl mx-auto"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search or start a conversation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ai-chat-input pl-10 pr-14"
        />
        <Button 
          type="submit" 
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-ai-purple-500 hover:bg-ai-purple-600"
          disabled={!query.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default SearchChat;
