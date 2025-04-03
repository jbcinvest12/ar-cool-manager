
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Calendar, 
  Tool, 
  Clipboard, 
  User2, 
  DollarSign,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServiceDetailProps {
  service: any;
  onEditClick: () => void;
  onBack: () => void;
}

export default function ServiceDetail({ service, onEditClick, onBack }: ServiceDetailProps) {
  const { t } = useTranslation();
  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);
  const [collaborator, setCollaborator] = useState<any>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [isLoadingCollaborator, setIsLoadingCollaborator] = useState(true);

  useEffect(() => {
    const fetchServiceItems = async () => {
      try {
        setIsLoadingItems(true);
        const { data, error } = await supabase
          .from("service_items")
          .select("*, inventory_item:inventory_items(id, name, value)")
          .eq("service_id", service.id);

        if (error) throw error;
        setServiceItems(data || []);
      } catch (error: any) {
        console.error("Error fetching service items:", error.message);
      } finally {
        setIsLoadingItems(false);
      }
    };

    const fetchClient = async () => {
      if (service.client_id) {
        try {
          setIsLoadingClient(true);
          const { data, error } = await supabase
            .from("clients")
            .select("*")
            .eq("id", service.client_id)
            .single();

          if (error) throw error;
          setClient(data);
        } catch (error: any) {
          console.error("Error fetching client:", error.message);
        } finally {
          setIsLoadingClient(false);
        }
      } else {
        setIsLoadingClient(false);
      }
    };

    const fetchCollaborator = async () => {
      if (service.collaborator_id) {
        try {
          setIsLoadingCollaborator(true);
          const { data, error } = await supabase
            .from("collaborators")
            .select("*")
            .eq("id", service.collaborator_id)
            .single();

          if (error) throw error;
          setCollaborator(data);
        } catch (error: any) {
          console.error("Error fetching collaborator:", error.message);
        } finally {
          setIsLoadingCollaborator(false);
        }
      } else {
        setIsLoadingCollaborator(false);
      }
    };

    fetchServiceItems();
    fetchClient();
    fetchCollaborator();
  }, [service]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPP", { locale: ptBR });
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{service.service_type}</Badge>
                {formatDate(service.service_date)}
              </div>
            </CardTitle>
            <div className="text-lg font-bold">
              R$ {service.total_value.toFixed(2)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t("services.client")}</div>
                    {isLoadingClient ? (
                      <Skeleton className="h-5 w-40" />
                    ) : client ? (
                      <div>{client.full_name}</div>
                    ) : (
                      <div className="text-muted-foreground">{t("services.no_client")}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t("services.date")}</div>
                    <div>{formatDate(service.service_date)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                    <Tool className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t("services.type")}</div>
                    <div>{service.service_type}</div>
                  </div>
                </div>
              </div>

              {/* Collaborator & Notes */}
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                    <User2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t("services.collaborator")}</div>
                    {isLoadingCollaborator ? (
                      <Skeleton className="h-5 w-40" />
                    ) : collaborator ? (
                      <div>{collaborator.name}</div>
                    ) : (
                      <div className="text-muted-foreground">{t("services.no_collaborator")}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t("services.total")}</div>
                    <div className="font-medium">R$ {service.total_value.toFixed(2)}</div>
                  </div>
                </div>

                {service.notes && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t("services.notes")}</div>
                      <div className="text-sm text-muted-foreground">{service.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("services.info")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 mb-4">
              <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                <Clipboard className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{t("services.id")}</div>
                <div className="text-xs text-muted-foreground">{service.id}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 flex items-center justify-center text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{t("services.created_at")}</div>
                <div>{formatDate(service.created_at)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("services.materials")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingItems ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : serviceItems.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {t("services.no_items_used")}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left font-medium p-2 pl-3">{t("services.item")}</th>
                    <th className="text-center font-medium p-2">{t("services.quantity")}</th>
                    <th className="text-right font-medium p-2">{t("services.price")}</th>
                    <th className="text-right font-medium p-2 pr-3">{t("services.subtotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2 pl-3">{item.inventory_item.name}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">R$ {item.price.toFixed(2)}</td>
                      <td className="p-2 pr-3 text-right font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/30">
                    <td colSpan={3} className="p-2 pl-3 text-right font-medium">
                      {t("services.total")}:
                    </td>
                    <td className="p-2 pr-3 text-right font-bold">
                      R$ {service.total_value.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
