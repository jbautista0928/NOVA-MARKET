import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import { requireAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;

  const supabase = createServiceSupabase();
  const body = await req.json();

  const { name, description, category_name, provider, image_urls } = body;

  let category_id: string | undefined;
  if (category_name) {
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
    category_id = category!.id;
  }

  const updateData: Record<string, any> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (provider !== undefined) updateData.provider = provider;
  if (image_urls !== undefined) updateData.image_urls = image_urls;
  if (category_id !== undefined) updateData.category_id = category_id;

  const { data, error } = await supabase
    .from("products")
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
  const { error } = await supabase.from("products").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
