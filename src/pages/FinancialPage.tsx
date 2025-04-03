
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import FinancialTable from "@/components/financial/FinancialTable";
import FinancialForm from "@/components/financial/FinancialForm";

export default function FinancialPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(subMonths(new Date(), 5)),
    endDate: endOfMonth(new Date()),
  });

  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
    "#82CA9D", "#FF6B6B", "#6A7FDB", "#61DAFB", "#F28A30"
  ];

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("financial_entries")
        .select(`
          *,
          client:clients(id, full_name),
          service:services(id, service_type)
        `)
        .gte("entry_date", format(dateRange.startDate, "yyyy-MM-dd"))
        .lte("entry_date", format(dateRange.endDate, "yyyy-MM-dd"))
        .order("entry_date", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      
      // Process data for charts
      processChartData(data || []);
    } catch (error: any) {
      console.error("Error fetching financial entries:", error.message);
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
    fetchEntries();
  }, [dateRange]);

  const processChartData = (data: any[]) => {
    // Calculate total revenue
    const total = data.reduce((sum, entry) => sum + parseFloat(entry.value), 0);
    setTotalRevenue(total);

    // Process monthly data
    const monthlyMap = new Map();
    
    // Initialize with last 6 months
    for (let i = 0; i <= 5; i++) {
      const date = subMonths(new Date(), i);
      const monthYear = format(date, "MMM yyyy", { locale: ptBR });
      monthlyMap.set(monthYear, 0);
    }

    // Sum up values by month
    data.forEach(entry => {
      const date = parseISO(entry.entry_date);
      const monthYear = format(date, "MMM yyyy", { locale: ptBR });
      
      const currentValue = monthlyMap.get(monthYear) || 0;
      monthlyMap.set(monthYear, currentValue + parseFloat(entry.value));
    });

    // Convert to array and sort by date
    const monthlyArray = Array.from(monthlyMap.entries()).map(([month, value]) => ({
      month,
      value: parseFloat(value as string),
    }));

    // Sort from oldest to newest
    monthlyArray.sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

    setMonthlyData(monthlyArray);

    // Process category data
    const categoryMap = new Map();
    
    // Group by service type
    data.forEach(entry => {
      if (entry.service && entry.service.service_type) {
        const serviceType = entry.service.service_type;
        const currentValue = categoryMap.get(serviceType) || 0;
        categoryMap.set(serviceType, currentValue + parseFloat(entry.value));
      } else {
        const currentValue = categoryMap.get(t("financial.other")) || 0;
        categoryMap.set(t("financial.other"), currentValue + parseFloat(entry.value));
      }
    });

    // Convert to array
    const categoryArray = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value: parseFloat(value as string),
    }));

    // Sort by value descending
    categoryArray.sort((a, b) => b.value - a.value);

    setCategoryData(categoryArray);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEntryAdd = () => {
    setActiveEntry(null);
    setActiveTab("add");
  };

  const handleEntryEdit = (entry: any) => {
    setActiveEntry(entry);
    setActiveTab("add");
  };

  const handleFormSuccess = () => {
    fetchEntries();
    setActiveTab("entries");
    setActiveEntry(null);
    toast({
      title: activeEntry 
        ? t("financial.updated_success")
        : t("financial.added_success"),
      description: activeEntry 
        ? t("financial.updated_success_desc")
        : t("financial.added_success_desc"),
    });
  };

  const handleDeleteSuccess = () => {
    fetchEntries();
    toast({
      title: t("financial.deleted_success"),
      description: t("financial.deleted_success_desc"),
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-sm p-3">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout title={t("financial.title")}>
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="overview">{t("financial.overview")}</TabsTrigger>
              <TabsTrigger value="entries">{t("financial.entries")}</TabsTrigger>
              <TabsTrigger value="add">{t("financial.add_entry")}</TabsTrigger>
            </TabsList>
            
            <div className="w-full md:w-auto">
              {activeTab === "entries" && (
                <Button onClick={handleEntryAdd}>
                  {t("financial.add_new")}
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Summary Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {t("financial.total_revenue")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-12 w-32" />
                  ) : (
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(totalRevenue)}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("financial.time_period", {
                      start: format(dateRange.startDate, "PP", { locale: ptBR }),
                      end: format(dateRange.endDate, "PP", { locale: ptBR }),
                    })}
                  </p>
                </CardContent>
              </Card>

              {/* Monthly Revenue Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {t("financial.monthly_trend")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis
                            tickFormatter={(value) => 
                              new Intl.NumberFormat('pt-BR', {
                                notation: 'compact',
                                compactDisplay: 'short',
                              }).format(value)
                            }
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="value"
                            name={t("financial.revenue")}
                            fill="var(--primary)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {t("financial.by_service_type")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : categoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {t("financial.no_category_data")}
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                          paddingAngle={3}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => formatCurrency(value)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entries">
            <Card>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <FinancialTable
                    entries={entries}
                    onEdit={handleEntryEdit}
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardContent className="p-6">
                <FinancialForm 
                  entry={activeEntry}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setActiveTab("entries")}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
