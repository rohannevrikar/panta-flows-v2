
import React, { useState } from 'react';
import { useAuth } from '@/frontend/contexts/AuthContext';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Label } from '@/frontend/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar';
import { useTheme } from '@/frontend/contexts/ThemeContext';
import { toast } from 'sonner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      await updateProfile({
        name,
        email,
        avatar,
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Update your personal information and how others see you on the platform.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar section */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback style={{ backgroundColor: theme.primaryColor }}>
                  {user?.name ? getInitials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <Label htmlFor="avatar">Profile Picture</Label>
                <Input
                  id="avatar"
                  type="text"
                  placeholder="URL to your avatar image"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Enter a URL to an image to use as your profile picture.
                </p>
              </div>
            </div>
            
            {/* Name field */}
            <div className="space-y-1">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            {/* Email field */}
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={true}
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Email address cannot be changed. Contact support for assistance.
              </p>
            </div>
            
            {/* Role information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-1">Account Type</h3>
              <p className="text-sm">
                You are signed in as: <span className="font-medium">{user?.role || 'User'}</span>
              </p>
              {user?.clientId && (
                <p className="text-sm mt-1">
                  Client ID: <span className="font-mono text-xs bg-gray-100 px-1 rounded">{user.clientId}</span>
                </p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => {
              setName(user?.name || '');
              setAvatar(user?.avatar || '');
            }}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
