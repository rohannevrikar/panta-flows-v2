
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Settings as SettingsIcon, Bell, Shield, Eye, Workflow, SlidersHorizontal } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import Logo from "@/components/Logo";

const Settings = () => {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("sk-1234567890abcdef1234567890abcdef");
  const [modelTemperature, setModelTemperature] = useState([65]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-black hover:text-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo />
          </div>
          <ProfileDropdown 
            name="Moin Arian" 
            email="moin@example.com"
            avatarUrl="/placeholder.svg"
          />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <SettingsIcon className="mr-2 h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 space-y-1">
            <div className="font-medium">Settings</div>
            <div className="text-sm text-gray-500">
              Manage your account settings and preferences
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications</Label>
                  <div className="text-sm text-gray-500">
                    Receive notifications about your account activity
                  </div>
                </div>
                <Switch 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <div className="text-sm text-gray-500">
                    Toggle between light and dark mode
                  </div>
                </div>
                <Switch 
                  checked={darkModeEnabled}
                  onCheckedChange={setDarkModeEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <div className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <Switch 
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                AI Settings
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    id="apiKey"
                    type="password" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)} 
                    className="font-mono"
                  />
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Show
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Your API key is used to authenticate requests to the AI service
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Model Temperature</Label>
                  <span className="text-sm">{modelTemperature[0]}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Conservative</span>
                  <Slider
                    className="flex-1"
                    value={modelTemperature}
                    onValueChange={setModelTemperature}
                    max={100}
                    step={1}
                  />
                  <span className="text-sm text-gray-600">Creative</span>
                </div>
                <p className="text-sm text-gray-500">
                  Adjust how creative the AI responses should be
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
