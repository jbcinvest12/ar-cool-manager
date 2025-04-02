
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Users, 
  Clipboard, 
  Package, 
  Database, 
  Tag, 
  UserCheck, 
  DollarSign, 
  Heart, 
  Settings, 
  HelpCircle, 
  FileText, 
  AlertCircle, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  LogOut, 
  Building,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { isAdmin, signOut } = useAuth();
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  
  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);
  
  const navItems: SidebarItem[] = [
    { path: "/dashboard", label: t('nav.dashboard'), icon: Home },
    { path: "/clients", label: t('nav.clients'), icon: Users },
    { path: "/services", label: t('nav.services'), icon: Clipboard },
    { path: "/products", label: t('nav.products'), icon: Package },
    { path: "/stock", label: t('nav.stock'), icon: Database },
    { path: "/categories", label: t('nav.categories'), icon: Tag },
    { path: "/collaborators", label: t('nav.collaborators'), icon: UserCheck },
    { path: "/financial", label: t('nav.financial'), icon: DollarSign },
    { path: "/loyalty", label: t('nav.loyalty'), icon: Heart },
    { path: "/settings", label: t('nav.settings'), icon: Settings },
    { path: "/support", label: t('nav.support'), icon: HelpCircle },
    { path: "/manual", label: t('nav.manual'), icon: FileText },
    { path: "/logs", label: t('nav.logs'), icon: AlertCircle, adminOnly: true },
    { path: "/permissions", label: t('nav.permissions'), icon: Lock, adminOnly: true },
    { path: "/saas", label: t('saas.title'), icon: Building, adminOnly: true },
  ];

  return (
    <div 
      className={cn(
        "h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo and brand */}
      <div className="p-4 flex items-center">
        <div className="flex-shrink-0 flex items-center">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md bg-coolblue-500 text-white font-bold",
            !collapsed && "mr-2"
          )}>
            AC
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg">AR Cool Manager</span>
          )}
        </div>
      </div>
      
      <Separator className="bg-sidebar-border" />
      
      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            // Skip admin-only items for non-admin users
            if (item.adminOnly && !isAdmin) return null;
            
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center py-2 px-3 rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className={cn("w-5 h-5", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <Separator className="bg-sidebar-border" />
      
      {/* Bottom actions */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full flex items-center justify-center",
            collapsed && "px-2"
          )}
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-4 w-4" />
              {!collapsed && <span className="ml-2">{t('app.theme.dark')}</span>}
            </>
          ) : (
            <>
              <Sun className="h-4 w-4" />
              {!collapsed && <span className="ml-2">{t('app.theme.light')}</span>}
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full flex items-center justify-center",
            collapsed && "px-2"
          )}
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">{t('app.logout')}</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full flex items-center justify-center",
            collapsed && "px-2"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">{t('app.collapse')}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
