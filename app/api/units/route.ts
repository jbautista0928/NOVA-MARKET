import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import { requireAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  const body = await req.json();

  const { product_id, purchase_price, list_price, sale_price, purchase_date, notes, quantity } = body;

  if (!product_id || purchase_price == null || list_price == null) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: product_id, purchase_price, list_price" },
      { status: 400 }
    );
  }

  const qty = quantity && quantity > 0 ? quantity : 1;
  const rows = Array.from({ length: qty }, () => ({
    product_id,
    purchase_price,
    list_price,
    sale_price: sale_price ?? null,
    purchase_date: purchase_date ?? null,
    notes: notes ?? null,
  }));

  const { data, error } = await supabase.from("units").insert(rows).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
