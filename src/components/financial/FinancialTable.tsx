
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
import { Search, Edit, Trash2, Calendar, User, Info } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface FinancialTableProps {
  entries: any[];
  onEdit: (entry: any) => void;
  onDeleteSuccess: () => void;
}

export default function FinancialTable({
  entries,
  onEdit,
  onDeleteSuccess,
}: FinancialTableProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEntries = entries.filter((entry) => {
    const clientName = entry.client?.full_name || "";
    const notes = entry.notes || "";
    const serviceType = entry.service?.service_type || "";
    
    return (
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDeleteClick = (entry: any) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("financial_entries")
        .delete()
        .eq("id", entryToDelete.id);

      if (error) throw error;

      onDeleteSuccess();
    } catch (error: any) {
      console.error("Error deleting financial entry:", error.message);
      toast({
        title: t("errors.delete_failed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("financial.search")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm
            ? t("financial.no_search_results")
            : t("financial.no_entries")}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("financial.date")}</TableHead>
                <TableHead>{t("financial.client")}</TableHead>
                <TableHead>{t("financial.type")}</TableHead>
                <TableHead className="text-right">{t("financial.value")}</TableHead>
                <TableHead>{t("financial.notes")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(entry.entry_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 max-w-[150px] truncate">
                      <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">
                        {entry.client?.full_name || t("financial.no_client")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.service?.service_type ? (
                      <Badge variant="outline">
                        {entry.service.service_type}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {t("financial.no_service")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(parseFloat(entry.value))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1 max-w-[200px]">
                      {entry.notes ? (
                        <>
                          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                          <span className="line-clamp-1 text-sm">
                            {entry.notes}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          —
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(entry)}
                        title={t("common.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(entry)}
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
            <AlertDialogTitle>{t("financial.delete_confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("financial.delete_warning", {
                date: entryToDelete?.entry_date
                  ? formatDate(entryToDelete.entry_date)
                  : "",
                value: entryToDelete?.value
                  ? formatCurrency(parseFloat(entryToDelete.value))
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
