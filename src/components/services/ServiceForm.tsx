
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Search, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceFormProps {
  service?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(true);
  const [isLoadingServiceTypes, setIsLoadingServiceTypes] = useState(true);
  const [isLoadingInventoryItems, setIsLoadingInventoryItems] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const formSchema = z.object({
    service_date: z.date({
      required_error: t("validation.service_date_required"),
    }),
    client_id: z.string().uuid().optional(),
    service_type: z.string({
      required_error: t("validation.service_type_required"),
    }),
    collaborator_id: z.string().uuid().optional(),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_date: service?.service_date ? new Date(service.service_date) : new Date(),
      client_id: service?.client_id || "",
      service_type: service?.service_type || "",
      collaborator_id: service?.collaborator_id || "",
      notes: service?.notes || "",
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true);
        const { data, error } = await supabase
          .from("clients")
          .select("id, full_name")
          .order("full_name");

        if (error) throw error;
        setClients(data || []);
      } catch (error: any) {
        console.error("Error fetching clients:", error.message);
      } finally {
        setIsLoadingClients(false);
      }
    };

    const fetchCollaborators = async () => {
      try {
        setIsLoadingCollaborators(true);
        const { data, error } = await supabase
          .from("collaborators")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setCollaborators(data || []);
      } catch (error: any) {
        console.error("Error fetching collaborators:", error.message);
      } finally {
        setIsLoadingCollaborators(false);
      }
    };

    const fetchServiceTypes = async () => {
      try {
        setIsLoadingServiceTypes(true);
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .eq("type", "service")
          .order("name");

        if (error) throw error;
        setServiceTypes(data || []);
      } catch (error: any) {
        console.error("Error fetching service types:", error.message);
      } finally {
        setIsLoadingServiceTypes(false);
      }
    };

    const fetchInventoryItems = async () => {
      try {
        setIsLoadingInventoryItems(true);
        const { data, error } = await supabase
          .from("inventory_items")
          .select("id, name, value")
          .order("name");

        if (error) throw error;
        setInventoryItems(data || []);
      } catch (error: any) {
        console.error("Error fetching inventory items:", error.message);
      } finally {
        setIsLoadingInventoryItems(false);
      }
    };

    const fetchServiceItems = async () => {
      if (service?.id) {
        try {
          const { data, error } = await supabase
            .from("service_items")
            .select("*, inventory_item:inventory_items(id, name, value)")
            .eq("service_id", service.id);

          if (error) throw error;
          
          const items = data.map((item: any) => ({
            id: item.id,
            inventory_item_id: item.inventory_item_id,
            name: item.inventory_item.name,
            quantity: item.quantity,
            price: item.price,
          }));
          
          setSelectedItems(items);
          calculateTotal(items);
        } catch (error: any) {
          console.error("Error fetching service items:", error.message);
        }
      }
    };

    fetchClients();
    fetchCollaborators();
    fetchServiceTypes();
    fetchInventoryItems();
    fetchServiceItems();
  }, [service]);

  useEffect(() => {
    if (service) {
      form.reset({
        service_date: service.service_date ? new Date(service.service_date) : new Date(),
        client_id: service.client_id || "",
        service_type: service.service_type || "",
        collaborator_id: service.collaborator_id || "",
        notes: service.notes || "",
      });
    }
  }, [service, form]);

  const calculateTotal = (items: any[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalValue(total);
  };

  const handleAddItem = (item: any) => {
    const existingItemIndex = selectedItems.findIndex(
      (selected) => selected.inventory_item_id === item.id
    );

    if (existingItemIndex >= 0) {
      // Item already exists, update quantity
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      setSelectedItems(updatedItems);
      calculateTotal(updatedItems);
    } else {
      // Add new item
      const newItem = {
        inventory_item_id: item.id,
        name: item.name,
        quantity: 1,
        price: item.value,
      };
      const updatedItems = [...selectedItems, newItem];
      setSelectedItems(updatedItems);
      calculateTotal(updatedItems);
    }

    setSearchTerm("");
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = quantity;
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const filteredItems = searchTerm
    ? inventoryItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      // For a real app, get the company_id from user's context/profile
      const company_id = "temporary_company_id"; // Replace with real company ID in production

      // Format date for Postgres
      const formattedDate = format(values.service_date, "yyyy-MM-dd");

      let serviceId;

      if (service) {
        // Update existing service
        const { error, data } = await supabase
          .from("services")
          .update({
            ...values,
            service_date: formattedDate,
            total_value: totalValue,
          })
          .eq("id", service.id)
          .select();

        if (error) throw error;
        serviceId = service.id;
      } else {
        // Create new service
        const { error, data } = await supabase
          .from("services")
          .insert([
            {
              ...values,
              company_id,
              service_date: formattedDate,
              total_value: totalValue,
            },
          ])
          .select();

        if (error) throw error;
        serviceId = data[0].id;
      }

      // If we have an existing service, delete all service items first
      if (service) {
        const { error } = await supabase
          .from("service_items")
          .delete()
          .eq("service_id", serviceId);

        if (error) throw error;
      }

      // Add new service items
      if (selectedItems.length > 0) {
        const serviceItems = selectedItems.map((item) => ({
          service_id: serviceId,
          inventory_item_id: item.inventory_item_id,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error } = await supabase
          .from("service_items")
          .insert(serviceItems);

        if (error) throw error;
      }

      // Create financial entry for the service
      if (values.client_id) {
        const financialEntry = {
          company_id,
          service_id: serviceId,
          client_id: values.client_id,
          value: totalValue,
          entry_date: formattedDate,
          notes: `${values.service_type} - ${
            clients.find((c) => c.id === values.client_id)?.full_name || ""
          }`,
        };

        const { error } = await supabase.from("financial_entries").insert([financialEntry]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving service:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {service ? t("services.edit") : t("services.add")}
      </h2>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="service_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("services.date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>{t("services.select_date")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("services.client")}</FormLabel>
                  <Select
                    disabled={isLoadingClients}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("services.select_client")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("services.type")}</FormLabel>
                  <Select
                    disabled={isLoadingServiceTypes}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("services.select_type")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collaborator_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("services.collaborator")}</FormLabel>
                  <Select
                    disabled={isLoadingCollaborators}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("services.select_collaborator")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {collaborators.map((collaborator) => (
                        <SelectItem key={collaborator.id} value={collaborator.id}>
                          {collaborator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Materials & Inventory Items */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">{t("services.materials")}</h3>
              
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("services.search_materials")}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {searchTerm && filteredItems.length > 0 && (
                  <div className="mt-2 border rounded-md p-2 bg-background shadow-sm max-h-64 overflow-auto">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 hover:bg-muted cursor-pointer rounded-md"
                        onClick={() => handleAddItem(item)}
                      >
                        <div>{item.name}</div>
                        <div className="flex items-center">
                          <div className="text-sm font-semibold mr-2">
                            R$ {item.value.toFixed(2)}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center font-medium text-sm border-b pb-2">
                  <div className="w-1/2">{t("services.item")}</div>
                  <div className="w-1/6 text-center">{t("services.quantity")}</div>
                  <div className="w-1/6 text-right">{t("services.price")}</div>
                  <div className="w-1/6 text-right">{t("services.subtotal")}</div>
                  <div className="w-8"></div>
                </div>
                
                {selectedItems.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    {t("services.no_items")}
                  </div>
                ) : (
                  <>
                    {selectedItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div className="w-1/2 truncate">{item.name}</div>
                        <div className="w-1/6 text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => 
                              handleQuantityChange(index, parseInt(e.target.value) || 1)
                            }
                            className="h-8 w-16 text-center"
                          />
                        </div>
                        <div className="w-1/6 text-right">
                          R$ {item.price.toFixed(2)}
                        </div>
                        <div className="w-1/6 text-right font-medium">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="w-8 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end items-center pt-4 border-t font-bold">
                      <div className="mr-8">{t("services.total")}</div>
                      <div className="text-lg">R$ {totalValue.toFixed(2)}</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("services.notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("services.notes_placeholder")}
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} type="button">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("common.saving")
                : service
                ? t("common.update")
                : t("common.save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
