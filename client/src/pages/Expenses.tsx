import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Calendar,
  Tag
} from "lucide-react";
import { ExpenseDialog } from "@/components/expenses/ExpenseDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import type { Expense } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Expenses() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const { data: expenses, isLoading } = useExpenses({ 
    search, 
    category: categoryFilter 
  });
  
  const deleteMutation = useDeleteExpense();

  const handleEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setExpenseToEdit(null);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Transactions
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and track every expense in detail.
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              size="lg" 
              className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2"
            >
              <Plus className="w-5 h-5" /> Add Expense
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-10 rounded-xl bg-card border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-xl bg-card border-border/50">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:grid">
              <div className="col-span-4 pl-2">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3 text-right pr-8">Amount</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            <div className="divide-y divide-border/50">
              {isLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                  Loading transactions...
                </div>
              ) : expenses?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 opacity-50" />
                  </div>
                  <p>No transactions found.</p>
                  <Button variant="link" onClick={() => setIsDialogOpen(true)}>Create your first expense</Button>
                </div>
              ) : (
                <AnimatePresence>
                  {expenses?.map((expense) => (
                    <motion.div 
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors group"
                    >
                      {/* Mobile View */}
                      <div className="flex justify-between items-start md:hidden w-full col-span-1">
                        <div>
                          <p className="font-semibold text-foreground">{expense.title}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(expense.date), "MMM d, yyyy")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatCurrency(Number(expense.amount))}</p>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium mt-1">
                            {expense.category}
                          </span>
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:block col-span-4 pl-2 font-medium text-foreground truncate">
                        {expense.title}
                      </div>
                      <div className="hidden md:block col-span-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {expense.category}
                        </span>
                      </div>
                      <div className="hidden md:block col-span-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(expense.date), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="hidden md:block col-span-3 text-right pr-8 font-bold font-mono text-foreground">
                        {formatCurrency(Number(expense.amount))}
                      </div>
                      <div className="flex justify-end md:justify-center col-span-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => handleEdit(expense)}>
                              <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setExpenseToDelete(expense)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
      </div>

      <ExpenseDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogOpenChange} 
        expenseToEdit={expenseToEdit}
      />

      <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              "{expenseToDelete?.title}" from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
