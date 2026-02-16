import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense, type Expense } from "@shared/schema";
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-expenses";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseToEdit?: Expense | null;
}

const CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Business",
  "Other"
];

export function ExpenseDialog({ open, onOpenChange, expenseToEdit }: ExpenseDialogProps) {
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const isEditing = !!expenseToEdit;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      title: "",
      amount: "",
      category: "Other",
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (expenseToEdit) {
      form.reset({
        title: expenseToEdit.title,
        amount: expenseToEdit.amount.toString(),
        category: expenseToEdit.category,
        date: new Date(expenseToEdit.date).toISOString().split('T')[0],
      });
    } else {
      form.reset({
        title: "",
        amount: "",
        category: "Other",
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [expenseToEdit, form, open]);

  const onSubmit = (data: InsertExpense) => {
    if (isEditing && expenseToEdit) {
      updateMutation.mutate(
        { id: expenseToEdit.id, ...data },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {isEditing ? "Edit Transaction" : "New Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the details of your expense." : "Add a new expense to track your spending."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Grocery shopping, Netflix, etc." className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
