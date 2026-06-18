import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), units(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  const body = await req.json();

  const {
    name,
    description,
    category_name,
    provider,
    image_urls,
    units, // array de { purchase_price, list_price, sale_price, purchase_date, notes }
  } = body;

  if (!name || !category_name || !units || !Array.isArray(units) || units.length === 0) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: name, category_name, units[]" },
      { status: 400 }
    );
  }

  // Buscar o crear la categoría (permite categorías dinámicas sugeridas por la IA)
  let { data: category } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", category_name)
    .maybeSingle();

  if (!category) {
    const { data: newCategory, error: catError } = await supabase
      .from("categories")
      .insert({ name: category_name })
      .select("id")
      .single();
    if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });
    category = newCategory;
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name,
      description: description || null,
      category_id: category!.id,
      provider: provider || null,
      image_urls: image_urls || [],
    })
    .select()
    .single();

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 });

  const unitsToInsert = units.map((u: any) => ({
    product_id: product.id,
    purchase_price: u.purchase_price,
    list_price: u.list_price,
    sale_price: u.sale_price ?? null,
    purchase_date: u.purchase_date ?? null,
    notes: u.notes ?? null,
  }));

  const { data: insertedUnits, error: unitsError } = await supabase
    .from("units")
    .insert(unitsToInsert)
    .select();

  if (unitsError) return NextResponse.json({ error: unitsError.message }, { status: 500 });

  return NextResponse.json({ data: { product, units: insertedUnits } });
}
