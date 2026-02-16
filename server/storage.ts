import { SupabaseClient } from '@supabase/supabase-js';
import { InsertExpense, Expense } from '@shared/schema';

export interface IStorage {
  getExpenses(client: SupabaseClient): Promise<Expense[]>;
  getExpense(client: SupabaseClient, id: number): Promise<Expense | undefined>;
  createExpense(client: SupabaseClient, expense: InsertExpense & { userId: string }): Promise<Expense>;
  updateExpense(client: SupabaseClient, id: number, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(client: SupabaseClient, id: number): Promise<void>;
  getStats(client: SupabaseClient): Promise<{
    totalBalance: number;
    monthlySpend: number;
    topCategory: string | null;
    categoryBreakdown: { name: string; value: number }[];
  }>;
}

export class SupabaseStorage implements IStorage {
  async getExpenses(client: SupabaseClient, filters?: { search?: string; category?: string }): Promise<Expense[]> {
    let query = client.from('expenses').select('*').order('date', { ascending: false });
    
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data as Expense[];
  }

  async getExpense(client: SupabaseClient, id: number): Promise<Expense | undefined> {
    const { data, error } = await client
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as Expense;
  }

  async createExpense(client: SupabaseClient, expense: InsertExpense & { userId: string }): Promise<Expense> {
    const { data, error } = await client
      .from('expenses')
      .insert({
        title: expense.title,
        amount: String(expense.amount),
        category: expense.category,
        date: expense.date,
        user_id: expense.userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Expense;
  }

  async updateExpense(client: SupabaseClient, id: number, expense: Partial<InsertExpense>): Promise<Expense> {
    const updates: any = {};
    if (expense.title !== undefined) updates.title = expense.title;
    if (expense.amount !== undefined) updates.amount = String(expense.amount);
    if (expense.category !== undefined) updates.category = expense.category;
    if (expense.date !== undefined) updates.date = expense.date;

    const { data, error } = await client
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Expense;
  }

  async deleteExpense(client: SupabaseClient, id: number): Promise<void> {
    const { error } = await client
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }

  async getStats(client: SupabaseClient) {
    const { data: expenses, error } = await client.from('expenses').select('*');
    if (error) throw new Error(error.message);

    const typedExpenses = expenses as Expense[];
    
    const totalBalance = typedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySpend = typedExpenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const categoryMap = new Map<string, number>();
    typedExpenses.forEach(e => {
      const val = Number(e.amount);
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + val);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
    
    let topCategory = null;
    let maxVal = 0;
    categoryBreakdown.forEach(c => {
      if (c.value > maxVal) {
        maxVal = c.value;
        topCategory = c.name;
      }
    });

    return {
      totalBalance,
      monthlySpend,
      topCategory,
      categoryBreakdown
    };
  }
}

export const storage = new SupabaseStorage();
