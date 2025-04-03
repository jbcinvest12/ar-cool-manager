
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ClientForm from "@/components/clients/ClientForm";
import ClientsList from "@/components/clients/ClientsList";
import ClientDetail from "@/components/clients/ClientDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error("Error fetching clients:", error.message);
      toast({
        title: t("errors.fetch_failed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    setActiveTab("detail");
  };

  const handleAddSuccess = () => {
    fetchClients();
    setActiveTab("list");
    toast({
      title: t("clients.added_success"),
      description: t("clients.added_success_desc"),
    });
  };

  const handleUpdateSuccess = () => {
    fetchClients();
    setActiveTab("list");
    setSelectedClient(null);
    toast({
      title: t("clients.updated_success"),
      description: t("clients.updated_success_desc"),
    });
  };

  const handleDeleteSuccess = () => {
    fetchClients();
    setActiveTab("list");
    setSelectedClient(null);
    toast({
      title: t("clients.deleted_success"),
      description: t("clients.deleted_success_desc"),
    });
  };

  const handleEditClick = (client: any) => {
    setSelectedClient(client);
    setActiveTab("add");
  };

  return (
    <Layout title={t("clients.title")}>
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-4">
            <TabsTrigger value="list">{t("clients.list")}</TabsTrigger>
            <TabsTrigger value="add">{t("clients.add")}</TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedClient}>
              {t("clients.details")}
            </TabsTrigger>
          </TabsList>

          <Card className="p-4">
            <TabsContent value="list">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <ClientsList 
                  clients={clients}
                  onClientSelect={handleClientSelect}
                  onEditClick={handleEditClick}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              )}
            </TabsContent>

            <TabsContent value="add">
              <ClientForm 
                client={selectedClient}
                onSuccess={selectedClient ? handleUpdateSuccess : handleAddSuccess}
                onCancel={() => {
                  setActiveTab("list");
                  setSelectedClient(null);
                }}
              />
            </TabsContent>

            <TabsContent value="detail">
              {selectedClient && (
                <ClientDetail 
                  client={selectedClient}
                  onEditClick={() => setActiveTab("add")}
                  onBack={() => setActiveTab("list")}
                />
              )}
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </Layout>
  );
}
