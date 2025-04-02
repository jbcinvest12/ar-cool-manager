
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  // Map routes to translated titles
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === "/dashboard") return t('dashboard.title');
    if (path === "/clients") return t('clients.title');
    if (path === "/services") return t('services.title');
    if (path === "/products") return t('products.title');
    if (path === "/stock") return t('stock.title');
    if (path === "/categories") return t('categories.title');
    if (path === "/collaborators") return t('collaborators.title');
    if (path === "/financial") return t('financial.title');
    if (path === "/loyalty") return t('loyalty.title');
    if (path === "/settings") return t('settings.title');
    if (path === "/support") return t('support.title');
    if (path === "/logs") return t('logs.title');
    if (path === "/manual") return t('manual.title');
    if (path === "/permissions") return t('permissions.title');
    if (path === "/saas") return t('saas.title');
    if (path === "/profile") return t('app.profile');
    
    return t('app.name');
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 z-50 transition-all duration-300 transform",
          showSidebar ? "translate-x-0" : "-translate-x-full",
          isMobile && "lg:hidden"
        )}
      >
        <Sidebar />
      </div>
      
      {/* Backdrop for mobile sidebar */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col h-screen",
        showSidebar && !isMobile && "ml-64"
      )}>
        <Header toggleSidebar={toggleSidebar} title={getPageTitle()} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
