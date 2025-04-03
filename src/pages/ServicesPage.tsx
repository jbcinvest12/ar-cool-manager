
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import ServiceForm from "@/components/services/ServiceForm";
import ServicesList from "@/components/services/ServicesList";
import ServiceDetail from "@/components/services/ServiceDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function ServicesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          client:clients(id, full_name),
          collaborator:collaborators(id, name)
        `)
        .order("service_date", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error("Error fetching services:", error.message);
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
    fetchServices();
  }, []);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setActiveTab("detail");
  };

  const handleAddSuccess = () => {
    fetchServices();
    setActiveTab("list");
    toast({
      title: t("services.added_success"),
      description: t("services.added_success_desc"),
    });
  };

  const handleUpdateSuccess = () => {
    fetchServices();
    setActiveTab("list");
    setSelectedService(null);
    toast({
      title: t("services.updated_success"),
      description: t("services.updated_success_desc"),
    });
  };

  const handleDeleteSuccess = () => {
    fetchServices();
    setActiveTab("list");
    setSelectedService(null);
    toast({
      title: t("services.deleted_success"),
      description: t("services.deleted_success_desc"),
    });
  };

  const handleEditClick = (service: any) => {
    setSelectedService(service);
    setActiveTab("add");
  };

  return (
    <Layout title={t("services.title")}>
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-4">
            <TabsTrigger value="list">{t("services.list")}</TabsTrigger>
            <TabsTrigger value="add">{t("services.add")}</TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedService}>
              {t("services.details")}
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
                <ServicesList 
                  services={services}
                  onServiceSelect={handleServiceSelect}
                  onEditClick={handleEditClick}
                  onDeleteSuccess={handleDeleteSuccess}
                />
              )}
            </TabsContent>

            <TabsContent value="add">
              <ServiceForm 
                service={selectedService}
                onSuccess={selectedService ? handleUpdateSuccess : handleAddSuccess}
                onCancel={() => {
                  setActiveTab("list");
                  setSelectedService(null);
                }}
              />
            </TabsContent>

            <TabsContent value="detail">
              {selectedService && (
                <ServiceDetail 
                  service={selectedService}
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
