
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // General settings
  const [companyName, setCompanyName] = useState("");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceReminders, setMaintenanceReminders] = useState(true);
  const [welcomeMessages, setWelcomeMessages] = useState(true);
  
  // WhatsApp API settings
  const [whatsAppApiUrl, setWhatsAppApiUrl] = useState("");
  const [whatsAppApiKey, setWhatsAppApiKey] = useState("");
  const [whatsAppInstanceName, setWhatsAppInstanceName] = useState("");
  
  // Loading states
  const [generalLoading, setGeneralLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);
  
  const handleSaveGeneral = async () => {
    setGeneralLoading(true);
    try {
      // Placeholder for saving to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('settings.saved'),
        description: t('settings.general_saved_description'),
      });
    } catch (error) {
      toast({
        title: t('settings.error'),
        description: t('settings.save_error'),
        variant: "destructive",
      });
    } finally {
      setGeneralLoading(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    setNotificationsLoading(true);
    try {
      // Placeholder for saving to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('settings.saved'),
        description: t('settings.notifications_saved_description'),
      });
    } catch (error) {
      toast({
        title: t('settings.error'),
        description: t('settings.save_error'),
        variant: "destructive",
      });
    } finally {
      setNotificationsLoading(false);
    }
  };
  
  const handleSaveWhatsApp = async () => {
    setWhatsAppLoading(true);
    try {
      // Placeholder for saving to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('settings.saved'),
        description: t('settings.whatsapp_saved_description'),
      });
    } catch (error) {
      toast({
        title: t('settings.error'),
        description: t('settings.save_error'),
        variant: "destructive",
      });
    } finally {
      setWhatsAppLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">{t('settings.tab_general')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('settings.tab_notifications')}</TabsTrigger>
            <TabsTrigger value="whatsapp">{t('settings.tab_whatsapp')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.general_settings')}</CardTitle>
                <CardDescription>
                  {t('settings.general_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t('settings.company_name')}</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="AR Cool Manager"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('settings.select_timezone')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                      <SelectItem value="America/Recife">America/Recife</SelectItem>
                      <SelectItem value="America/Manaus">America/Manaus</SelectItem>
                      <SelectItem value="America/Belem">America/Belem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleSaveGeneral} disabled={generalLoading}>
                  {generalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('settings.save')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notification_settings')}</CardTitle>
                <CardDescription>
                  {t('settings.notification_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications" className="flex-1">
                    {t('settings.email_notifications')}
                    <p className="text-sm text-muted-foreground">
                      {t('settings.email_notifications_description')}
                    </p>
                  </Label>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceReminders" className="flex-1">
                    {t('settings.maintenance_reminders')}
                    <p className="text-sm text-muted-foreground">
                      {t('settings.maintenance_reminders_description')}
                    </p>
                  </Label>
                  <Switch
                    id="maintenanceReminders"
                    checked={maintenanceReminders}
                    onCheckedChange={setMaintenanceReminders}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="welcomeMessages" className="flex-1">
                    {t('settings.welcome_messages')}
                    <p className="text-sm text-muted-foreground">
                      {t('settings.welcome_messages_description')}
                    </p>
                  </Label>
                  <Switch
                    id="welcomeMessages"
                    checked={welcomeMessages}
                    onCheckedChange={setWelcomeMessages}
                  />
                </div>
                
                <Button onClick={handleSaveNotifications} disabled={notificationsLoading}>
                  {notificationsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('settings.save')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.whatsapp_settings')}</CardTitle>
                <CardDescription>
                  {t('settings.whatsapp_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsAppApiUrl">{t('settings.whatsapp_api_url')}</Label>
                  <Input
                    id="whatsAppApiUrl"
                    value={whatsAppApiUrl}
                    onChange={(e) => setWhatsAppApiUrl(e.target.value)}
                    placeholder="https://api.whatsapp.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsAppApiKey">{t('settings.whatsapp_api_key')}</Label>
                  <Input
                    id="whatsAppApiKey"
                    value={whatsAppApiKey}
                    onChange={(e) => setWhatsAppApiKey(e.target.value)}
                    type="password"
                    placeholder="••••••••••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsAppInstanceName">{t('settings.whatsapp_instance_name')}</Label>
                  <Input
                    id="whatsAppInstanceName"
                    value={whatsAppInstanceName}
                    onChange={(e) => setWhatsAppInstanceName(e.target.value)}
                    placeholder="arcool-manager"
                  />
                </div>
                
                <Button onClick={handleSaveWhatsApp} disabled={whatsAppLoading}>
                  {whatsAppLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('settings.save')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
