import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const updateExpenseSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }).optional(),
  category: z.string().min(1).optional(),
  date: z.string().optional(),
});

function getSupabase(authorization: string | undefined) {
  if (!authorization) throw new Error("No authorization header");
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error("Supabase credentials not configured");
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authorization } },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

  try {
    const client = getSupabase(req.headers.authorization);
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
      const { data, error } = await client
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) return res.status(404).json({ message: "Expense not found" });
      return res.json(data);
    }

    if (req.method === "PUT") {
      const input = updateExpenseSchema.parse(req.body);
      const updates: any = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.amount !== undefined) updates.amount = String(input.amount);
      if (input.category !== undefined) updates.category = input.category;
      if (input.date !== undefined) updates.date = input.date;

      const { data, error } = await client
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return res.json(data);
    }

    if (req.method === "DELETE") {
      const { error } = await client.from("expenses").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
}
