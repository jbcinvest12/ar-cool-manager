
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileFormData {
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    email: user?.email || '',
    name: '',
    avatarUrl: null,
  });
  
  const [securityData, setSecurityData] = useState<SecurityFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [user]);
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileError(null);
    
    try {
      // Update profile in Supabase
      // Note: This is a placeholder for when the profiles table is created
      
      // Handle avatar upload if there's a file
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id || 'avatar'}-${Date.now()}.${fileExt}`;
        
        // This is a placeholder for when the storage is set up
        // const { error: uploadError } = await supabase.storage
        //   .from('avatars')
        //   .upload(fileName, avatarFile);
        
        // if (uploadError) throw uploadError;
      }
      
      toast({
        title: t('profile.updated_title'),
        description: t('profile.updated_description'),
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      setProfileError(error.message);
    } finally {
      setIsProfileLoading(false);
    }
  };
  
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSecurityLoading(true);
    setSecurityError(null);
    
    try {
      if (securityData.newPassword !== securityData.confirmPassword) {
        throw new Error(t('auth.passwords_dont_match'));
      }
      
      if (securityData.newPassword.length < 6) {
        throw new Error(t('auth.password_too_short'));
      }
      
      // This is a simplified version - in a real app, you'd verify the current password first
      const { error } = await supabase.auth.updateUser({ 
        password: securityData.newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: t('profile.password_updated_title'),
        description: t('profile.password_updated_description'),
      });
      
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error("Error updating password:", error.message);
      setSecurityError(error.message);
    } finally {
      setIsSecurityLoading(false);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setProfileData({
        ...profileData,
        avatarUrl: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">{t('profile.tab_profile')}</TabsTrigger>
            <TabsTrigger value="security">{t('profile.tab_security')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.personal_info')}</CardTitle>
                <CardDescription>
                  {t('profile.personal_info_description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {profileError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{profileError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-6">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.avatarUrl || ''} />
                        <AvatarFallback className="text-2xl">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Label htmlFor="avatar" className="cursor-pointer text-sm text-primary hover:underline">
                        {t('profile.change_avatar')}
                      </Label>
                      <Input 
                        id="avatar" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                      />
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('profile.email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('profile.name')}</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          placeholder={t('profile.name_placeholder')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isProfileLoading} className="w-full">
                    {isProfileLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('profile.save_changes')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.security_settings')}</CardTitle>
                <CardDescription>
                  {t('profile.security_settings_description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  {securityError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{securityError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('profile.current_password')}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('profile.new_password')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('profile.confirm_password')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSecurityLoading} className="w-full">
                    {isSecurityLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t('profile.update_password')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfilePage;
