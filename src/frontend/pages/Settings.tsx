
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Languages, Palette, Bell, LogOut } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Switch } from "@/frontend/components/ui/switch";
import { Label } from "@/frontend/components/ui/label";
import { Separator } from "@/frontend/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/frontend/components/ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "@/frontend/contexts/AuthContext";
import { useLanguage } from "@/frontend/contexts/LanguageContext";
import { useTheme } from "@/frontend/contexts/ThemeContext";
import LanguageSelector from "@/frontend/components/LanguageSelector";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { translate } = useLanguage();
  const { clientId, setClientId } = useTheme();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success(translate('settings.logoutSuccess'));
    } catch (error) {
      toast.error(translate('settings.logoutError'));
    }
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
          <h1 className="text-2xl font-bold">{translate('settings.title')}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Appearance settings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">{translate('settings.appearance')}</h2>
                </div>
                <Separator className="mb-6" />
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">{translate('settings.clientTheme')}</h3>
                    <RadioGroup 
                      className="grid grid-cols-2 md:grid-cols-3 gap-2"
                      value={clientId}
                      onValueChange={setClientId}
                    >
                      {['panta', 'zettaVal', 'cloudVision', 'neuroCraft'].map((client) => (
                        <div key={client} className="flex items-start space-x-2">
                          <RadioGroupItem value={client} id={`client-${client}`} />
                          <Label htmlFor={`client-${client}`} className="capitalize">
                            {client}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Language settings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">{translate('settings.language')}</h2>
                </div>
                <Separator className="mb-6" />
                
                <div>
                  <h3 className="text-sm font-medium mb-3">{translate('settings.selectLanguage')}</h3>
                  <LanguageSelector />
                </div>
              </CardContent>
            </Card>
            
            {/* Notifications settings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">{translate('settings.notifications')}</h2>
                </div>
                <Separator className="mb-6" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{translate('settings.emailNotifications')}</p>
                      <p className="text-sm text-gray-500">{translate('settings.emailNotificationsDesc')}</p>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{translate('settings.pushNotifications')}</p>
                      <p className="text-sm text-gray-500">{translate('settings.pushNotificationsDesc')}</p>
                    </div>
                    <Switch 
                      checked={pushNotifications} 
                      onCheckedChange={setPushNotifications} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Account actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">{translate('settings.account')}</h2>
                <Separator className="mb-6" />
                
                <div className="space-y-4">
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {translate('settings.logout')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center text-sm text-gray-500">
              <p>Version 1.0.0</p>
              <p className="mt-1">© 2023 PANTA AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
