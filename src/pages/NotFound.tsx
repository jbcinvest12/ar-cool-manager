
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuário tentou acessar uma rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center justify-center max-w-md">
        <div className="bg-red-500/10 p-3 rounded-full mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl mb-4">{t('app.error')}</h2>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não foi encontrada ou não existe.
        </p>
        <Button asChild>
          <Link to="/">{t('app.back')}</Link>
        </Button>
      </div>
    </div>
  );
}
