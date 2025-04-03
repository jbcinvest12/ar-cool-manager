
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Search, Edit, Trash2, User2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollaboratorsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [collaboratorDialog, setCollaboratorDialog] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, { message: t("validation.name_required") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchCollaborators = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("collaborators")
        .select("*")
        .order("name");

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error: any) {
      console.error("Error fetching collaborators:", error.message);
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
    fetchCollaborators();
  }, []);

  const resetForm = () => {
    form.reset({
      name: "",
    });
  };

  const openCollaboratorDialog = (collaborator?: any) => {
    if (collaborator) {
      setEditingCollaborator(collaborator);
      form.reset({
        name: collaborator.name,
      });
    } else {
      setEditingCollaborator(null);
      resetForm();
    }
    setCollaboratorDialog(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // For a real app, get the company_id from user's context/profile
      const company_id = "temporary_company_id"; // Replace with real company ID in production

      if (editingCollaborator) {
        // Update existing collaborator
        const { error } = await supabase
          .from("collaborators")
          .update(values)
          .eq("id", editingCollaborator.id);

        if (error) throw error;

        toast({
          title: t("collaborators.updated"),
          description: t("collaborators.updated_desc"),
        });
      } else {
        // Create new collaborator
        const { error } = await supabase.from("collaborators").insert([
          {
            ...values,
            company_id,
          },
        ]);

        if (error) throw error;

        toast({
          title: t("collaborators.created"),
          description: t("collaborators.created_desc"),
        });
      }

      setCollaboratorDialog(false);
      fetchCollaborators();
    } catch (error: any) {
      toast({
        title: t("errors.save_failed"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (collaborator: any) => {
    setCollaboratorToDelete(collaborator);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collaboratorToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("collaborators")
        .delete()
        .eq("id", collaboratorToDelete.id);

      if (error) throw error;

      toast({
        title: t("collaborators.deleted"),
        description: t("collaborators.deleted_desc"),
      });
      fetchCollaborators();
    } catch (error: any) {
      console.error("Error deleting collaborator:", error.message);
      toast({
        title: t("errors.delete_failed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCollaboratorToDelete(null);
    }
  };

  const filteredCollaborators = collaborators.filter((collaborator) =>
    collaborator.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title={t("collaborators.title")}>
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("collaborators.search")}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => openCollaboratorDialog()} className="w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              {t("collaborators.add")}
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredCollaborators.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm
                ? t("collaborators.no_search_results")
                : t("collaborators.no_collaborators")}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("collaborators.name")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollaborators.map((collaborator) => (
                    <TableRow key={collaborator.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User2 className="h-4 w-4 text-muted-foreground" />
                          {collaborator.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openCollaboratorDialog(collaborator)}
                            title={t("common.edit")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(collaborator)}
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
        </Card>
      </div>

      {/* Collaborator Form Dialog */}
      <Dialog open={collaboratorDialog} onOpenChange={setCollaboratorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCollaborator ? t("collaborators.edit") : t("collaborators.add")}
            </DialogTitle>
            <DialogDescription>
              {editingCollaborator
                ? t("collaborators.edit_desc")
                : t("collaborators.add_desc")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("collaborators.name")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("collaborators.name_placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCollaboratorDialog(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit">
                  {editingCollaborator ? t("common.save") : t("common.create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("collaborators.delete_confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("collaborators.delete_warning", {
                name: collaboratorToDelete?.name,
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
    </Layout>
  );
}
