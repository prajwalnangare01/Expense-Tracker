import { useExpenseStats } from "@/hooks/use-expenses";
import { formatCurrency } from "@/lib/utils";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { data: stats, isLoading, error } = useExpenseStats();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error loading dashboard</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Financial Overview
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your spending and manage your budget efficiently.
              </p>
            </div>
            <Link href="/expenses">
              <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Manage Transactions
              </Button>
            </Link>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-3"
          >
            <motion.div variants={item}>
              <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Spent
                  </CardTitle>
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Wallet className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display">{formatCurrency(Number(stats?.totalBalance || 0))}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lifetime spending
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Spend
                  </CardTitle>
                  <div className="bg-destructive/10 p-2 rounded-full text-destructive">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display">{formatCurrency(Number(stats?.monthlySpend || 0))}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This month's activity
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="rounded-2xl shadow-sm border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top Category
                  </CardTitle>
                  <div className="bg-accent/10 p-2 rounded-full text-accent">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display truncate">
                    {stats?.topCategory || "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Highest spending area
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-7"
          >
            <Card className="col-span-4 rounded-2xl shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="font-display">Spending Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground text-sm">No data to display</div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3 rounded-2xl shadow-sm border-border/50 bg-primary/5 border-none">
              <CardHeader>
                <CardTitle className="font-display text-primary-foreground/90">Quick Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Review your spending habits regularly. Identifying small, recurring expenses that aren't necessary can help you save significantly over time.
                  </p>
                  <div className="h-px bg-border/20 w-full" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Next Goal
                  </p>
                  <div className="flex justify-between items-center bg-card p-3 rounded-xl shadow-sm">
                    <span className="text-sm font-medium">Emergency Fund</span>
                    <span className="text-sm font-bold text-primary">35%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
      </div>
    </div>
  );
}
