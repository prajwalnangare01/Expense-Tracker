import type { Express } from "express";
import { createServer, type Server } from "http";
import { createClient } from "@supabase/supabase-js";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Helper to create Supabase client with user's token
  const getSupabase = (req: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    return createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
  };

  // Auth middleware-like helper
  const requireAuth = async (req: any, res: any) => {
    try {
      const client = getSupabase(req);
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) {
        res.status(401).json({ message: "Unauthorized" });
        return null;
      }
      return { client, user };
    } catch (e) {
      res.status(401).json({ message: "Unauthorized: Missing credentials" });
      return null;
    }
  };

  app.get(api.expenses.list.path, async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const filters = {
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined,
      };
      const expenses = await storage.getExpenses(auth.client, filters);
      res.json(expenses);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get(api.expenses.get.path, async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const expense = await storage.getExpense(auth.client, Number(req.params.id));
      if (!expense) return res.status(404).json({ message: "Expense not found" });
      res.json(expense);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post(api.expenses.create.path, async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const input = api.expenses.create.input.parse(req.body);
      const expense = await storage.createExpense(auth.client, {
        ...input,
        userId: auth.user.id
      });
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  app.put(api.expenses.update.path, async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const input = api.expenses.update.input.parse(req.body);
      const expense = await storage.updateExpense(auth.client, Number(req.params.id), input);
      res.json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: (err as Error).message });
    }
  });

  app.delete(api.expenses.delete.path, async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      await storage.deleteExpense(auth.client, Number(req.params.id));
      res.status(204).send();
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get(api.expenses.stats.path, async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    try {
      const stats = await storage.getStats(auth.client);
      res.json({
        ...stats,
        totalBalance: String(stats.totalBalance),
        monthlySpend: String(stats.monthlySpend)
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}
