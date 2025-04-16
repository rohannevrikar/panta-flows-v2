import { useState, useRef, useEffect } from "react";
import { Search, Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchChatProps {
  onFocus?: () => void;
  autoFocus?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (text: string, files: File[]) => void;
  disableNavigation?: boolean;
  onSearch: (query: string) => void;
}

const SearchChat = ({ 
  onFocus, 
  autoFocus = false, 
  value, 
  onChange,
  onSubmit,
  disableNavigation = false,
  onSearch
}: SearchChatProps) => {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!query.trim() && !value?.trim()) && files.length === 0) return;
    
    const currentText = value || query;
    
    if (onSubmit) {
      setUploading(true);
      try {
        await onSubmit(currentText, files);
      } finally {
        setUploading(false);
      }
    } else {
      console.log("Search or chat:", currentText, "Files:", files);
    }
    
    if (!value) {
      setQuery("");
    }
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFocus = () => {
    if (onFocus && !disableNavigation) onFocus();
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setQuery(e.target.value);
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
              <span className="truncate max-w-[150px]">File {index + 1}</span>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1 hover:bg-black hover:text-white" 
                onClick={() => removeFile(index)}
                disabled={uploading}
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
        <Input
          ref={inputRef}
          type="text"
          placeholder={uploading ? "Uploading files..." : "Search or start a conversation..."}
          value={value !== undefined ? value : query}
          onChange={handleQueryChange}
          onFocus={handleFocus}
          className="ai-chat-input pl-10 pr-24"
          disabled={uploading}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-black hover:text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Paperclip className="h-4 w-4" />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Button>
          <Button 
            type="submit" 
            size="icon"
            className="h-8 w-8 bg-panta-blue hover:bg-black hover:text-white"
            disabled={uploading || (!(value || query).trim() && files.length === 0)}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SearchChat;
