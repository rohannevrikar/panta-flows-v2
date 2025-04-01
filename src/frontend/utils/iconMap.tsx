
import { 
  Icon,
  Image, 
  FileText, 
  BarChart2, 
  Tablet, 
  Palette, 
  Grid, 
  Layout, 
  Code, 
  Share2,
  Camera,
  Brush,
  PenTool,
  FileImage,
  Layers,
  Type,
  Video,
  Music,
  BarChart,
  Line,
  Hexagon,
  Box,
  TrendingUp,
  List,
  ListTodo,
  Workflow,
  FileEdit,
  LucideIcon,
  ImagePlus,
  Shirt,
  Newspaper
} from 'lucide-react';

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  Image,
  ImagePlus,
  FileText,
  BarChart2,
  BarChart,
  Tablet,
  Palette,
  Grid,
  Layout,
  Code,
  Share2,
  Camera,
  Brush,
  PenTool,
  FileImage,
  Layers,
  Type,
  Video,
  Music,
  Line,
  Hexagon,
  Box,
  TrendingUp,
  List,
  ListTodo,
  Workflow,
  FileEdit,
  Shirt,
  Newspaper
};

// Function to get icon component by name
export const getIconByName = (name: string): LucideIcon => {
  return iconMap[name] || Image; // Default to Image if the icon isn't found
};
