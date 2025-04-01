
import { 
  MessageSquare, FileText, Settings, 
  History, Search, Upload, Code, 
  Bot, Brain, Database, Server,
  Users, User, Home, Lock,
  FileQuestion, HelpCircle, FileImage,
  LucideIcon
} from "lucide-react";

// Type for available icon names
export type IconName = 
  | "MessageSquare" 
  | "FileText" 
  | "Settings" 
  | "History" 
  | "Search" 
  | "Upload" 
  | "Code" 
  | "Bot" 
  | "Brain" 
  | "Database" 
  | "Server" 
  | "Users" 
  | "User" 
  | "Home" 
  | "Lock"
  | "FileQuestion"
  | "HelpCircle"
  | "FileImage";

// Map of icon names to their components
export const iconMap: Record<IconName, LucideIcon> = {
  MessageSquare,
  FileText,
  Settings,
  History,
  Search,
  Upload,
  Code,
  Bot,
  Brain,
  Database,
  Server,
  Users,
  User,
  Home,
  Lock,
  FileQuestion,
  HelpCircle,
  FileImage
};

export const getIconByName = (iconName: string): LucideIcon => {
  return iconMap[iconName as IconName] || MessageSquare;
};
