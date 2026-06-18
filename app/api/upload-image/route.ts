import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase-server";
import { requireAdminSession } from "@/lib/auth";

const BUCKET = "product-images";

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;

  try {
    const { image_base64, media_type, filename } = await req.json();

    if (!image_base64 || !media_type) {
      return NextResponse.json({ error: "Falta image_base64 o media_type" }, { status: 400 });
    }

    const supabase = createServiceSupabase();
    const ext = media_type.split("/")[1] || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(image_base64, "base64");

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: media_type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("Error subiendo imagen:", err);
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 });
  }
}
