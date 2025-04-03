
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FinancialFormProps {
  entry?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FinancialForm({ entry, onSuccess, onCancel }: FinancialFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  const formSchema = z.object({
    entry_date: z.date({
      required_error: t("validation.date_required"),
    }),
    client_id: z.string().uuid().optional().nullable(),
    service_id: z.string().uuid().optional().nullable(),
    value: z.coerce.number().min(0, { message: t("validation.value_min") }),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entry_date: entry?.entry_date ? new Date(entry.entry_date) : new Date(),
      client_id: entry?.client_id || null,
      service_id: entry?.service_id || null,
      value: entry?.value ? parseFloat(entry.value) : 0,
      notes: entry?.notes || "",
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

    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const { data, error } = await supabase
          .from("services")
          .select("id, service_type, service_date, client:clients(id, full_name)")
          .order("service_date", { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (error: any) {
        console.error("Error fetching services:", error.message);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchClients();
    fetchServices();
  }, []);

  useEffect(() => {
    if (entry) {
      form.reset({
        entry_date: entry.entry_date ? new Date(entry.entry_date) : new Date(),
        client_id: entry.client_id || null,
        service_id: entry.service_id || null,
        value: entry.value ? parseFloat(entry.value) : 0,
        notes: entry.notes || "",
      });
    }
  }, [entry, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      // For a real app, get the company_id from user's context/profile
      const company_id = "temporary_company_id"; // Replace with real company ID in production

      // Format date for Postgres
      const formattedDate = format(values.entry_date, "yyyy-MM-dd");

      if (entry) {
        // Update existing entry
        const { error } = await supabase
          .from("financial_entries")
          .update({
            ...values,
            entry_date: formattedDate,
          })
          .eq("id", entry.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase.from("financial_entries").insert([
          {
            ...values,
            company_id,
            entry_date: formattedDate,
          },
        ]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving financial entry:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {entry ? t("financial.edit_entry") : t("financial.add_entry")}
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
              name="entry_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("financial.date")}</FormLabel>
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
                            <span>{t("financial.select_date")}</span>
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
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("financial.value")}</FormLabel>
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
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("financial.client")}</FormLabel>
                  <Select
                    disabled={isLoadingClients}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("financial.select_client")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">{t("financial.no_client")}</SelectItem>
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
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("financial.service")}</FormLabel>
                  <Select
                    disabled={isLoadingServices}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("financial.select_service")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">{t("financial.no_service")}</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.service_type} - {formatDate(new Date(service.service_date))}
                          {service.client && ` - ${service.client.full_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("financial.service_desc")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("financial.notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("financial.notes_placeholder")}
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
                : entry
                ? t("common.update")
                : t("common.save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
