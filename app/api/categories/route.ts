import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase.from("categories").select("*").order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
