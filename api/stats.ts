import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

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
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const client = getSupabase(req.headers.authorization);
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return res.status(401).json({ message: "Unauthorized" });

    const { data: expenses, error } = await client.from("expenses").select("*");
    if (error) throw new Error(error.message);

    const totalBalance = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySpend = expenses
      .filter((e: any) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    const categoryMap = new Map<string, number>();
    expenses.forEach((e: any) => {
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + Number(e.amount));
    });
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    let topCategory: string | null = null;
    let maxVal = 0;
    categoryBreakdown.forEach((c) => {
      if (c.value > maxVal) { maxVal = c.value; topCategory = c.name; }
    });

    return res.json({
      totalBalance: String(totalBalance),
      monthlySpend: String(monthlySpend),
      topCategory,
      categoryBreakdown,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
}
