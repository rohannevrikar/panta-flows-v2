
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/frontend/contexts/AuthContext'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/frontend/components/ui/dropdown-menu';
import { Button } from '@/frontend/components/ui/button';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/frontend/contexts/LanguageContext';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Get user initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (!user) return null;
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => {
            setOpen(false);
            navigate('/profile');
          }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>{translate('profile.title')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            navigate('/settings');
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>{translate('settings.title')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{translate('common.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
