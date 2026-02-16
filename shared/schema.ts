import { pgTable, text, numeric, timestamp, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = pgTable("expenses", {
  
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(), // Supabase Auth user ID
  title: text("title").notNull(),
  amount: numeric("amount").notNull(), // Use numeric for money
  category: text("category").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ 
  //id: true, 
  createdAt: true,
  userId: true 
}).extend({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  date: z.string(), // Date string from form
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
