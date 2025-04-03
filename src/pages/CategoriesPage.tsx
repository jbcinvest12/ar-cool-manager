
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
import { Tabs, TabsContent, TabsContent as TabContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Search, Edit, Trash2, Package, Tool } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const formSchema = z.object({
    name: z.string().min(1, { message: t("validation.name_required") }),
    type: z.enum(["product", "service"], {
      required_error: t("validation.type_required"),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "product",
    },
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error.message);
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
    fetchCategories();
  }, []);

  const resetForm = () => {
    form.reset({
      name: "",
      type: "product",
    });
  };

  const openCategoryDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      form.reset({
        name: category.name,
        type: category.type,
      });
    } else {
      setEditingCategory(null);
      resetForm();
    }
    setCategoryDialog(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // For a real app, get the company_id from user's context/profile
      const company_id = "temporary_company_id"; // Replace with real company ID in production

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update(values)
          .eq("id", editingCategory.id);

        if (error) throw error;

        toast({
          title: t("categories.updated"),
          description: t("categories.updated_desc"),
        });
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert([
          {
            ...values,
            company_id,
          },
        ]);

        if (error) throw error;

        toast({
          title: t("categories.created"),
          description: t("categories.created_desc"),
        });
      }

      setCategoryDialog(false);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: t("errors.save_failed"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (category: any) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryToDelete.id);

      if (error) throw error;

      toast({
        title: t("categories.deleted"),
        description: t("categories.deleted_desc"),
      });
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error.message);
      toast({
        title: t("errors.delete_failed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = 
      activeTab === "all" || 
      (activeTab === "product" && category.type === "product") ||
      (activeTab === "service" && category.type === "service");
    return matchesSearch && matchesType;
  });

  const getCategoryIcon = (type: string) => {
    return type === "product" ? <Package className="h-4 w-4" /> : <Tool className="h-4 w-4" />;
  };

  return (
    <Layout title={t("categories.title")}>
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("categories.search")}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full sm:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">{t("categories.all")}</TabsTrigger>
                  <TabsTrigger value="product">{t("categories.products")}</TabsTrigger>
                  <TabsTrigger value="service">{t("categories.services")}</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={() => openCategoryDialog()} className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                {t("categories.add")}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm
                ? t("categories.no_search_results")
                : t("categories.no_categories")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("categories.name")}</TableHead>
                  <TableHead>{t("categories.type")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          category.type === "product" 
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-50" 
                            : "bg-green-50 text-green-600 hover:bg-green-50"
                        }
                      >
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(category.type)}
                          {category.type === "product" 
                            ? t("categories.product_type") 
                            : t("categories.service_type")}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openCategoryDialog(category)}
                          title={t("common.edit")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(category)}
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
          )}
        </Card>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t("categories.edit") : t("categories.add")}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? t("categories.edit_desc") : t("categories.add_desc")}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("categories.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("categories.name_placeholder")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("categories.type")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!editingCategory}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("categories.select_type")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="product">
                          <span className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {t("categories.product_type")}
                          </span>
                        </SelectItem>
                        <SelectItem value="service">
                          <span className="flex items-center gap-2">
                            <Tool className="h-4 w-4" />
                            {t("categories.service_type")}
                          </span>
                        </SelectItem>
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
                  onClick={() => setCategoryDialog(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit">
                  {editingCategory ? t("common.save") : t("common.create")}
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
            <AlertDialogTitle>{t("categories.delete_confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("categories.delete_warning", {
                name: categoryToDelete?.name,
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
