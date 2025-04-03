
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClientFormProps {
  client?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const formSchema = z.object({
    full_name: z.string().min(2, { message: t("validation.name_min") }),
    formal_name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    notes: z.string().optional(),
    send_maintenance_reminders: z.boolean().default(false),
    send_welcome_message: z.boolean().default(false),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: client?.full_name || "",
      formal_name: client?.formal_name || "",
      phone: client?.phone || "",
      address: client?.address || "",
      district: client?.district || "",
      city: client?.city || "",
      notes: client?.notes || "",
      send_maintenance_reminders: client?.send_maintenance_reminders || false,
      send_welcome_message: client?.send_welcome_message || false,
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        full_name: client.full_name || "",
        formal_name: client.formal_name || "",
        phone: client.phone || "",
        address: client.address || "",
        district: client.district || "",
        city: client.city || "",
        notes: client.notes || "",
        send_maintenance_reminders: client.send_maintenance_reminders || false,
        send_welcome_message: client.send_welcome_message || false,
      });
    }
  }, [client, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      // For a real app, get the company_id from user's context/profile
      const company_id = "temporary_company_id"; // Replace with real company ID in production

      if (client) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update(values)
          .eq("id", client.id);

        if (error) throw error;
      } else {
        // Create new client
        const { error } = await supabase.from("clients").insert([
          {
            ...values,
            company_id,
          },
        ]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving client:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {client ? t("clients.edit") : t("clients.add")}
      </h2>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("clients.full_name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("clients.full_name_placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formal_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("clients.formal_name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("clients.formal_name_placeholder")} {...field} />
                </FormControl>
                <FormDescription>{t("clients.formal_name_desc")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("clients.phone")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("clients.phone_placeholder")} {...field} />
                </FormControl>
                <FormDescription>{t("clients.phone_desc")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("clients.address")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("clients.address_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("clients.district")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("clients.district_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("clients.city")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("clients.city_placeholder")} {...field} />
                  </FormControl>
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
                <FormLabel>{t("clients.notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("clients.notes_placeholder")}
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="send_maintenance_reminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t("clients.send_maintenance_reminders")}</FormLabel>
                    <FormDescription>
                      {t("clients.send_maintenance_reminders_desc")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="send_welcome_message"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t("clients.send_welcome_message")}</FormLabel>
                    <FormDescription>
                      {t("clients.send_welcome_message_desc")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} type="button">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("common.saving")
                : client
                ? t("common.update")
                : t("common.save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
