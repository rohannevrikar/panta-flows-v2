
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getClientTheme, clientThemes } from "@/lib/client-themes";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ThemeSwitcherProps {
  visible?: boolean;
}

const ThemeSwitcher = ({ visible = false }: ThemeSwitcherProps) => {
  const { updateTheme } = useTheme();
  
  if (!visible) return null;

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-gray-50">
      <div className="text-sm font-medium mb-2 flex items-center gap-2">
        <Palette size={14} /> Client Theme
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(clientThemes).map((clientId) => (
          <Button
            key={clientId}
            size="sm"
            variant="outline"
            onClick={() => updateTheme(getClientTheme(clientId))}
          >
            {clientThemes[clientId].clientName}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
