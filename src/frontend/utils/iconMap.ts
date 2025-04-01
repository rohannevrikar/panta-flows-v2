
import { 
  Bot, 
  Code, 
  FileText, 
  Image, 
  MessageSquare, 
  Music, 
  Video,
  History,
  Settings,
  User,
  Mail,
  FileType,
  FileImage,
  FileAudio,
  FileVideo,
  File,
  BarChart,
  Globe,
  Zap,
  LucideIcon
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  "Bot": Bot,
  "Code": Code,
  "Document": FileText,
  "FileText": FileText,
  "Image": Image,
  "MessageSquare": MessageSquare,
  "Chat": MessageSquare,
  "Music": Music,
  "Video": Video,
  "History": History,
  "Settings": Settings,
  "User": User,
  "Mail": Mail,
  "FileType": FileType,
  "FileImage": FileImage,
  "FileAudio": FileAudio,
  "FileVideo": FileVideo,
  "File": File,
  "BarChart": BarChart,
  "Globe": Globe,
  "Zap": Zap
};

export const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || File; // Default to File icon if not found
};
