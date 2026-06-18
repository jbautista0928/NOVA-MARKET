import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import { requireAdminSession } from "@/lib/auth";

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  const body = await req.json();

  const updateData: Record<string, any> = {};
  const fields = ["purchase_price", "list_price", "sale_price", "status", "purchase_date", "arrival_date", "notes"];
  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f];
  }

  // Si se marca como vendido y no se especifica fecha/mes, se autocompleta con hoy
  if (body.status === "vendido") {
    const today = new Date();
    if (!body.sold_date) updateData.sold_date = today.toISOString().slice(0, 10);
    if (!body.sold_month) updateData.sold_month = MONTHS_ES[today.getMonth()];
  }

  const { data, error } = await supabase
    .from("units")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  const { error } = await supabase.from("units").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
