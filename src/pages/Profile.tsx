
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileDropdown from "@/components/ProfileDropdown";
import Logo from "@/components/Logo";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("Moin Arian");
  const [email, setEmail] = useState("moin@example.com");
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg");
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      
      // Simulate file upload
      setTimeout(() => {
        const file = e.target.files![0];
        const newAvatarUrl = URL.createObjectURL(file);
        setAvatarUrl(newAvatarUrl);
        setIsUploading(false);
        toast.success("Profile picture updated successfully!");
      }, 1000);
    }
  };

  const handleSave = () => {
    toast.success("Profile settings saved successfully!");
  };

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
            name={name} 
            email={email} 
            avatarUrl={avatarUrl}
          />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Profile Settings</h1>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                  <AvatarFallback className="text-xl">
                    {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center w-full h-full">
                    <Upload className="text-white w-6 h-6" />
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-medium">Profile Picture</h2>
                <p className="text-sm text-gray-500 mb-2">Upload a new profile picture</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Change Avatar"}
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
