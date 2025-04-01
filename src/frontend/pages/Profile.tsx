
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Camera, Mail, User, Building, Save } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/frontend/components/ui/avatar";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Separator } from "@/frontend/components/ui/separator";
import { useToast } from "@/frontend/hooks/use-toast";
import { useAuth } from "@/frontend/contexts/AuthContext";
import { useLanguage } from "@/frontend/contexts/LanguageContext";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const { translate } = useLanguage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: 'ACME Corp',
    avatar: user?.avatar || '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        name: formData.name,
      });
      toast({
        title: translate('profile.updateSuccess'),
        description: translate('profile.updateSuccessDesc'),
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: translate('profile.updateError'),
        description: translate('profile.updateErrorDesc'),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{translate('profile.title')}</h1>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  {formData.avatar ? (
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full bg-white"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                
                <div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                  >
                    {isEditing ? translate('profile.cancel') : translate('profile.edit')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">{translate('profile.personalInfo')}</h3>
            <Separator className="mb-6" />
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {translate('profile.name')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {translate('profile.email')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true} // Email can't be changed
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organization" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {translate('profile.organization')}
                  </Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? translate('profile.saving') : translate('profile.saveChanges')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
