
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServicesListProps {
  services: any[];
  onServiceSelect: (service: any) => void;
  onEditClick: (service: any) => void;
  onDeleteSuccess: () => void;
}

export default function ServicesList({
  services,
  onServiceSelect,
  onEditClick,
  onDeleteSuccess,
}: ServicesListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredServices = services.filter((service) =>
    (service.client?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.service_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.collaborator?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (service: any) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceToDelete.id);

      if (error) throw error;

      onDeleteSuccess();
    } catch (error: any) {
      console.error("Error deleting service:", error.message);
      toast({
        title: t("errors.delete_failed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("services.search")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm
            ? t("services.no_search_results")
            : t("services.no_services")}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">{t("services.client")}</TableHead>
                <TableHead className="w-[20%]">{t("services.type")}</TableHead>
                <TableHead className="w-[15%]">{t("services.date")}</TableHead>
                <TableHead className="w-[15%]">{t("services.collaborator")}</TableHead>
                <TableHead className="w-[15%] text-right">{t("services.total")}</TableHead>
                <TableHead className="w-[10%] text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => onServiceSelect(service)}
                  >
                    {service.client?.full_name || t("services.no_client")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.service_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(service.service_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.collaborator?.name || "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {service.total_value.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditClick(service)}
                        title={t("common.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(service)}
                        title={t("common.delete")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("services.delete_confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("services.delete_warning", {
                client: serviceToDelete?.client?.full_name || t("services.no_client"),
                date: serviceToDelete?.service_date
                  ? formatDate(serviceToDelete?.service_date)
                  : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
