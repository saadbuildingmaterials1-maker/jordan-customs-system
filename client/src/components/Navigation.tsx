import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calculator, 
  FileText, 
  Package, 
  LayoutDashboard, 
  Ship,
  Menu,
  X,
  Info,
  User,
  Shield,
  FileCheck,
  ChevronRight,
  DollarSign,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainNavItems = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/calculator", label: "حاسبة التكاليف", icon: Calculator },
    { href: "/customs-declaration", label: "البيان الجمركي", icon: FileText },
    { href: "/container-tracking", label: "تتبع الحاويات", icon: Ship },
    { href: "/shipments", label: "إدارة الشحنات", icon: Package },
    { href: "/suppliers", label: "إدارة الموردين", icon: Users },
  ];

  const secondaryNavItems = [
    { href: "/pricing", label: "الأسعار", icon: DollarSign },
    { href: "/about", label: "من نحن", icon: Info },
    { href: "/developer", label: "المطور", icon: User },
    { href: "/privacy", label: "الخصوصية", icon: Shield },
    { href: "/terms", label: "الشروط", icon: FileCheck },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === href;
    }
    return location.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed right-0 top-0 h-screen bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 z-50 flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          {sidebarOpen ? (
            <Link href="/">
              <div className="cursor-pointer">
                <img src="/logo.webp" alt="تكلفتي" className="h-12 w-auto object-contain" />
              </div>
            </Link>
          ) : (
            <Link href="/">
              <div className="cursor-pointer">
                <img src="/logo.webp" alt="تكلفتي" className="h-10 w-10 object-contain" />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform",
                sidebarOpen ? "rotate-0" : "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                القوائم الرئيسية
              </p>
            )}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-3",
                      !sidebarOpen && "justify-center px-2",
                      active && "bg-red-600 hover:bg-red-700 text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-right flex-1">{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="space-y-1 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            {sidebarOpen && (
              <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                معلومات إضافية
              </p>
            )}
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-3",
                      !sidebarOpen && "justify-center px-2"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-right flex-1">{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="cursor-pointer">
                <img src="/logo.webp" alt="تكلفتي" className="h-12 w-auto object-contain" />
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {sidebarOpen && (
            <div className="pb-4 space-y-1">
              <div className="space-y-1 mb-4">
                <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  القوائم الرئيسية
                </p>
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-2",
                          active && "bg-red-600 hover:bg-red-700 text-white"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  معلومات إضافية
                </p>
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for sidebar on desktop */}
      <div className={cn("hidden lg:block transition-all duration-300", sidebarOpen ? "w-64" : "w-20")} />
    </>
  );
}
