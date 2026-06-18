import { createServiceSupabase } from "@/lib/supabase-server";
import type { CatalogItem } from "@/types";
import CatalogGrid from "@/components/CatalogGrid";
import ShippingBanner from "@/components/ShippingBanner";

export const revalidate = 0; // siempre datos frescos

async function getCatalog(): Promise<CatalogItem[]> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("catalog_view")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return [];
  }
  return data as CatalogItem[];
}

export default async function HomePage() {
  const items = await getCatalog();

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="bg-neutral-950 px-4 py-6 text-center text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Nova<span className="text-blue-500">Market</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-300">
          Tecnología, moto, hogar y más — al mejor precio
        </p>
      </header>

      <ShippingBanner />

      <CatalogGrid items={items} />

      <footer className="border-t border-neutral-200 bg-white px-4 py-6 text-center text-xs text-neutral-500">
        <p>NovaMarket © {new Date().getFullYear()} — Ventas online</p>
        <p className="mt-1">
          Contacto: +57 313 394 0435 · jbautista0928@gmail.com
        </p>
      </footer>
    </main>
  );
}
