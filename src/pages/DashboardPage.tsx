
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, ResponsiveContainer, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Users, Clipboard, DollarSign, Calendar } from "lucide-react";

// Dados de exemplo para demonstração
const mockServiceData = [
  { month: 'Jan', serviços: 42, valor: 4200 },
  { month: 'Fev', serviços: 38, valor: 3800 },
  { month: 'Mar', serviços: 55, valor: 5500 },
  { month: 'Abr', serviços: 47, valor: 4700 },
  { month: 'Mai', serviços: 60, valor: 6000 },
  { month: 'Jun', serviços: 65, valor: 6500 },
];

const mockRecentServices = [
  { id: 1, client: 'Empresa ABC', service: 'Manutenção AC', date: '2023-10-10', value: 450 },
  { id: 2, client: 'Restaurante XYZ', service: 'Instalação Split', date: '2023-10-09', value: 1200 },
  { id: 3, client: 'Escritório Legal', service: 'Limpeza de Filtros', date: '2023-10-08', value: 280 },
  { id: 4, client: 'Residencial Flores', service: 'Reparo Compressor', date: '2023-10-07', value: 750 },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("month");
  const [statsData, setStatsData] = useState({
    clients: 120,
    services: 450,
    revenue: 45000,
    pending: 8
  });

  // Simula carregamento de dados
  useEffect(() => {
    // Em um sistema real, isso carregaria dados do Supabase
    console.log("Dashboard carregado");
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}{user?.email?.split('@')[0]}</h2>
            <p className="text-muted-foreground">
              Aqui está um resumo do seu negócio
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs defaultValue="month" className="w-[250px]" onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
                <TabsTrigger value="year">Ano</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              {t('app.filter')}
            </Button>
          </div>
        </div>
        
        {/* Cards de estatísticas */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.clients.total')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.clients}</div>
              <p className="text-xs text-muted-foreground">
                +5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.services.total')}
              </CardTitle>
              <Clipboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.services}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.revenue.total')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {statsData.revenue.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-gradient">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.services.pending')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.pending}</div>
              <p className="text-xs text-muted-foreground">
                -2 em relação à semana anterior
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráficos */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Serviços Realizados</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockServiceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="serviços" fill="#0ca5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockServiceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="valor" stroke="#0369a1" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Serviços Recentes */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>{t('dashboard.services.recent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium p-2">Cliente</th>
                    <th className="text-left font-medium p-2">Serviço</th>
                    <th className="text-left font-medium p-2">Data</th>
                    <th className="text-right font-medium p-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecentServices.map((service) => (
                    <tr key={service.id} className="border-b border-border">
                      <td className="p-2">{service.client}</td>
                      <td className="p-2">{service.service}</td>
                      <td className="p-2">{new Date(service.date).toLocaleDateString()}</td>
                      <td className="p-2 text-right">R$ {service.value.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
