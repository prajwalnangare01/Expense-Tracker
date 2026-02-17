import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const insertExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  category: z.string().min(1),
  date: z.string(),
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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const client = getSupabase(req.headers.authorization);
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
      const { data, error } = await client
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw new Error(error.message);
      return res.json(data);
    }

    if (req.method === "POST") {
      const input = insertExpenseSchema.parse(req.body);
      const { data, error } = await client
        .from("expenses")
        .insert({
          title: input.title,
          amount: String(input.amount),
          category: input.category,
          date: input.date,
          user_id: user.id,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return res.status(201).json(data);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
}
