
import { useState, useRef } from "react";
import { Search, Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchChat = () => {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && files.length === 0) return;
    
    // Handle search/chat submission with files
    console.log("Search or chat:", query, "Files:", files);
    setQuery("");
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative w-full max-w-3xl mx-auto"
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 text-sm">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1" 
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search or start a conversation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ai-chat-input pl-10 pr-24"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </Button>
          <Button 
            type="submit" 
            size="icon"
            className="h-8 w-8 bg-panta-blue hover:bg-panta-blue-600"
            disabled={!query.trim() && files.length === 0}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchChat;
