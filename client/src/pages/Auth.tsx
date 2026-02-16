import { useState, useEffect } from "react";
import { useAuth, supabase } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Loader2, WalletCards, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { session } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (session) {
      setLocation("/");
    }
  }, [session, setLocation]);

  if (session) {
    return null;
  }

  const handleAuth = async (type: "login" | "register") => {
    setIsLoading(true);
    try {
      if (type === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Navigation handled by auth state change
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during authentication.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        {/* Abstract shapes for visual interest */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <WalletCards className="w-8 h-8" />
            </div>
            <h1 className="font-display font-bold text-2xl tracking-tight">SpendWise</h1>
          </div>
          
          <div className="mt-24 space-y-6 max-w-lg">
            <h2 className="text-4xl font-display font-bold leading-tight">
              Master your money, <br/>
              unleash your potential.
            </h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Track expenses, visualize spending patterns, and make informed financial decisions with our intuitive dashboard.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} SpendWise Inc. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex items-center justify-center p-6 bg-background relative">
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="absolute top-4 right-4 rounded-full"
          data-testid="button-theme-toggle"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8 text-primary">
            <WalletCards className="w-8 h-8" />
            <span className="font-display font-bold text-2xl">SpendWise</span>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="text-center px-0">
              <CardTitle className="text-2xl font-display font-bold">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-xl bg-muted/50 p-1">
                  <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="hello@example.com" 
                      className="rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      className="rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                    size="lg"
                    onClick={() => handleAuth("login")}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder="hello@example.com" 
                      className="rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      className="rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                    size="lg"
                    onClick={() => handleAuth("register")}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
