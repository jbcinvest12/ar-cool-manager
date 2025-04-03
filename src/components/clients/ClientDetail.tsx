
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Phone, Mail, MapPin, MessageSquare, CalendarClock, ClipboardList } from "lucide-react";

interface ClientDetailProps {
  client: any;
  onEditClick: () => void;
  onBack: () => void;
}

export default function ClientDetail({ client, onEditClick, onBack }: ClientDetailProps) {
  const { t } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("client_id", client.id)
          .order("service_date", { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (error: any) {
        console.error("Error fetching services:", error.message);
      } finally {
        setIsLoadingServices(false);
      }
    };

    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const { data, error } = await supabase
          .from("sent_messages")
          .select("*")
          .eq("client_id", client.id)
          .order("sent_at", { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (error: any) {
        console.error("Error fetching messages:", error.message);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchServices();
    fetchMessages();
  }, [client.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <Button onClick={onEditClick} className="gap-1">
          <Edit className="h-4 w-4" />
          {t("common.edit")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div>{client.full_name}</div>
              <div>
                {client.send_maintenance_reminders && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 hover:bg-blue-50">
                    {t("clients.maintenance_enabled")}
                  </Badge>
                )}
                {client.send_welcome_message && (
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 hover:bg-green-50">
                    {t("clients.welcome_enabled")}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {client.formal_name && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t("clients.formal_name")}</div>
                      <div>{client.formal_name}</div>
                    </div>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t("clients.phone")}</div>
                      <div>{client.phone}</div>
                    </div>
                  </div>
                )}

                {(client.address || client.district || client.city) && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t("clients.address")}</div>
                      <div>
                        {client.address}
                        {client.district && `, ${client.district}`}
                        {client.city && `, ${client.city}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                {client.notes && (
                  <div className="border rounded-md p-3 bg-muted/20">
                    <div className="text-sm font-medium mb-2">{t("clients.notes")}</div>
                    <div className="whitespace-pre-wrap text-sm">{client.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("clients.info")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{t("clients.created_at")}</div>
                <div>{formatDate(client.created_at)}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{t("clients.total_services")}</div>
                <div>{isLoadingServices ? <Skeleton className="h-4 w-16" /> : services.length}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{t("clients.total_messages")}</div>
                <div>{isLoadingMessages ? <Skeleton className="h-4 w-16" /> : messages.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="services">{t("clients.services_history")}</TabsTrigger>
          <TabsTrigger value="messages">{t("clients.messages_history")}</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardContent className="p-4">
            <TabsContent value="services" className="mt-0">
              {isLoadingServices ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("clients.no_services")}
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={service.id} className="border rounded-md p-4 hover:border-primary">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {`${index + 1}º ${t("services.title")}`} - {formatDate(service.service_date)}
                        </div>
                        <Badge variant="outline">
                          {service.service_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {t("services.total_value")}: R$ {service.total_value.toFixed(2)}
                      </div>
                      {service.notes && (
                        <div className="text-sm mt-2">
                          <div className="font-medium">{t("services.notes")}:</div>
                          <div className="text-muted-foreground">{service.notes}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="messages" className="mt-0">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("clients.no_messages")}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {message.type === "welcome" 
                            ? t("messages.welcome") 
                            : message.type === "maintenance" 
                              ? t("messages.maintenance")
                              : t("messages.custom")}
                        </div>
                        <Badge variant={message.status === "success" ? "success" : "destructive"}>
                          {message.status === "success" ? t("messages.sent") : t("messages.failed")}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {new Date(message.sent_at).toLocaleString()}
                      </div>
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
