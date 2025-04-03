
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Search, Edit, Trash2, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemDialog, setItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const formSchema = z.object({
    name: z.string().min(1, { message: t("validation.name_required") }),
    value: z.coerce.number().min(0, { message: t("validation.value_min") }),
    category_id: z.string().uuid().optional().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: 0,
      category_id: null,
    },
  });

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("inventory_items")
        .select(`
          *,
          category:categories(id, name)
        `)
        .order("name");

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching inventory items:", error.message);
      toast({
        title: t("errors.fetch_failed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("type", "product")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const resetForm = () => {
    form.reset({
      name: "",
      value: 0,
      category_id: null,
    });
  };

  const openItemDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      form.reset({
        name: item.name,
        value: parseFloat(item.value),
        category_id: item.category_id,
      });
    } else {
      setEditingItem(null);
      resetForm();
    }
    setItemDialog(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // For a real app, get the company_id from user's context/profile
      const company_id = "temporary_company_id"; // Replace with real company ID in production

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from("inventory_items")
          .update(values)
          .eq("id", editingItem.id);

        if (error) throw error;

        toast({
          title: t("inventory.updated"),
          description: t("inventory.updated_desc"),
        });
      } else {
        // Create new item
        const { error } = await supabase.from("inventory_items").insert([
          {
            ...values,
            company_id,
          },
        ]);

        if (error) throw error;

        toast({
          title: t("inventory.created"),
          description: t("inventory.created_desc"),
        });
      }

      setItemDialog(false);
      fetchItems();
    } catch (error: any) {
      toast({
        title: t("errors.save_failed"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      toast({
        title: t("inventory.deleted"),
        description: t("inventory.deleted_desc"),
      });
      fetchItems();
    } catch (error: any) {
      console.error("Error deleting inventory item:", error.message);
      toast({
        title: t("errors.delete_failed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout title={t("inventory.title")}>
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("inventory.search")}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <Select
                value={categoryFilter || ""}
                onValueChange={(value) => setCategoryFilter(value || null)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={t("inventory.filter_by_category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("inventory.all_categories")}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => openItemDialog()} className="w-full md:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                {t("inventory.add")}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || categoryFilter
                ? t("inventory.no_search_results")
                : t("inventory.no_items")}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("inventory.name")}</TableHead>
                    <TableHead>{t("inventory.category")}</TableHead>
                    <TableHead className="text-right">{t("inventory.value")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.category ? (
                          <Badge variant="outline">
                            <Tag className="h-3.5 w-3.5 mr-1" />
                            {item.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {t("inventory.no_category")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {parseFloat(item.value).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openItemDialog(item)}
                            title={t("common.edit")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(item)}
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

      {/* Inventory Item Form Dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t("inventory.edit") : t("inventory.add")}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? t("inventory.edit_desc") : t("inventory.add_desc")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("inventory.name_placeholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.value")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          R$
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-8"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.category")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("inventory.select_category")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t("inventory.no_category")}</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setItemDialog(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit">
                  {editingItem ? t("common.save") : t("common.create")}
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
            <AlertDialogTitle>{t("inventory.delete_confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.delete_warning", {
                name: itemToDelete?.name,
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
