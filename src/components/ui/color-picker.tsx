import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const colors = [
  '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666',
  '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6',
  '#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc',
  '#00ff00', '#33ff33', '#66ff66', '#99ff99', '#ccffcc',
  '#0000ff', '#3333ff', '#6666ff', '#9999ff', '#ccccff',
  '#ffff00', '#ffff33', '#ffff66', '#ffff99', '#ffffcc',
  '#ff00ff', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff',
  '#00ffff', '#33ffff', '#66ffff', '#99ffff', '#ccffff',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: value }}
            />
            <span>{value}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-8 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className="h-8 w-8 rounded-full border"
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}; 