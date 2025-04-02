
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const { resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await resetPassword(email);
      setMessage("Instruções de redefinição de senha foram enviadas para seu e-mail.");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={theme === 'light' ? t('app.theme.dark') : t('app.theme.light')}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            className={i18n.language === 'pt-BR' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => handleLanguageChange('pt-BR')}
          >
            PT
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={i18n.language === 'en-US' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => handleLanguageChange('en-US')}
          >
            EN
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={i18n.language === 'es-ES' ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => handleLanguageChange('es-ES')}
          >
            ES
          </Button>
        </div>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-coolblue-500 text-white font-bold text-xl mb-2">
            AC
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('app.name')}</h1>
          <p className="text-muted-foreground">{t('app.tagline')}</p>
        </div>
        
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>{t('auth.reset')}</CardTitle>
            <CardDescription>
              Digite seu e-mail para receber instruções de redefinição de senha
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              
              {message && (
                <div className="bg-green-500/10 text-green-500 text-sm p-3 rounded-md">
                  {message}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com.br"
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full mb-4" 
                disabled={isLoading}
              >
                {isLoading ? t('app.loading') : t('auth.reset')}
              </Button>
              
              <Link to="/login" className="text-sm inline-flex items-center text-primary hover:underline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('app.back')} {t('auth.login')}
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
