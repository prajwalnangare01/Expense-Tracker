import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Helper to add auth header
const getAuthHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export function useExpenses(filters?: { search?: string; category?: string }) {
  const { session } = useAuth();
  const token = session?.access_token;

  return useQuery({
    queryKey: [api.expenses.list.path, filters],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category && filters.category !== "all") params.append("category", filters.category);

      const url = `${api.expenses.list.path}?${params.toString()}`;
      const res = await fetch(url, {
        headers: getAuthHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to fetch expenses");
      return api.expenses.list.responses[200].parse(await res.json());
    },
  });
}

export function useExpenseStats() {
  const { session } = useAuth();
  const token = session?.access_token;

  return useQuery({
    queryKey: [api.expenses.stats.path],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch(api.expenses.stats.path, {
        headers: getAuthHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.expenses.stats.responses[200].parse(await res.json());
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.expenses.create.input>) => {
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch(api.expenses.create.path, {
        method: api.expenses.create.method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create expense");
      }
      return api.expenses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.expenses.stats.path] });
      toast({ title: "Expense added", description: "Your transaction has been recorded." });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: error.message 
      });
    }
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.expenses.update.input>) => {
      if (!token) throw new Error("Not authenticated");
      
      const url = buildUrl(api.expenses.update.path, { id });
      const res = await fetch(url, {
        method: api.expenses.update.method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update expense");
      return api.expenses.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.expenses.stats.path] });
      toast({ title: "Expense updated", description: "Changes saved successfully." });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: error.message 
      });
    }
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.access_token;
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error("Not authenticated");
      
      const url = buildUrl(api.expenses.delete.path, { id });
      const res = await fetch(url, {
        method: api.expenses.delete.method,
        headers: getAuthHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to delete expense");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.expenses.stats.path] });
      toast({ title: "Expense deleted", description: "Transaction removed." });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: error.message 
      });
    }
  });
}
