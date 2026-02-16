import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Receipt, 
  LogOut, 
  WalletCards,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Sidebar({ isMobile = false, className }: { isMobile?: boolean, className?: string }) {
  const [location] = useLocation();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expenses", label: "Transactions", icon: Receipt },
  ];

  const sidebarClasses = isMobile 
    ? "flex flex-col w-full h-full bg-card" 
    : cn("hidden md:flex flex-col w-64 h-screen border-r border-border bg-card sticky top-0", className);

  return (
    <aside className={sidebarClasses}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-2 rounded-xl">
            <WalletCards className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight">SpendWise</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</span>
            <span className="text-sm font-semibold truncate max-w-[120px]">{user?.email?.split('@')[0]}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" data-testid="button-sidebar-theme-toggle">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to access your expenses and dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={signOut}
                className="bg-destructive hover:bg-destructive/90 rounded-xl"
                data-testid="button-confirm-logout"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
