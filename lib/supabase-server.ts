import { createClient } from "@supabase/supabase-js";

// IMPORTANTE: este cliente usa la SERVICE_ROLE key, que tiene
// permiso total (ignora RLS). Solo se usa en código que corre
// en el servidor (API routes / Server Components), NUNCA se
// importa desde un componente de cliente ("use client").
export function createServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
