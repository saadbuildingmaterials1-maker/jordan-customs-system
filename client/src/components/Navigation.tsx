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
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/calculator", label: "حاسبة التكاليف", icon: Calculator },
    { href: "/customs-declaration", label: "البيان الجمركي", icon: FileText },
    { href: "/container-tracking", label: "تتبع الحاويات", icon: Ship },
    { href: "/shipments", label: "إدارة الشحنات", icon: Package },
  ];

  const secondaryNavItems = [
    { href: "/about", label: "من نحن", icon: Info },
    { href: "/developer", label: "المطور", icon: User },
    { href: "/pricing", label: "الأسعار", icon: Calculator },
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
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  تكلفتي
                </span>
              </div>
            </Link>

            {/* Main Nav Items */}
            <div className="flex items-center gap-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Secondary Nav Items */}
            <div className="flex items-center gap-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  تكلفتي
                </span>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="pb-4 space-y-1">
              <div className="space-y-1 mb-4">
                <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  القوائم الرئيسية
                </p>
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setMobileMenuOpen(false)}
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
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setMobileMenuOpen(false)}
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
    </>
  );
}
