import Link from "next/link";
import { createServiceSupabase } from "@/lib/supabase-server";
import AdminProductCard from "@/components/AdminProductCard";
import LogoutButton from "@/components/LogoutButton";

export const revalidate = 0;

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

async function getProducts() {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("products")
    .select("*, categories(name), units(*)")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function AdminDashboard() {
  const products = await getProducts();

  const allUnits = products.flatMap((p: any) => p.units || []);
  const capitalInvertido = allUnits.reduce((s: number, u: any) => s + u.purchase_price, 0);
  const vendidos = allUnits.filter((u: any) => u.status === "vendido");
  const ingresosTotales = vendidos.reduce((s: number, u: any) => s + (u.sale_price ?? u.list_price), 0);
  const gananciaTotal = vendidos.reduce(
    (s: number, u: any) => s + ((u.sale_price ?? u.list_price) - u.purchase_price),
    0
  );
  const disponibles = allUnits.filter((u: any) => u.status === "disponible").length;
  const roi = capitalInvertido > 0 ? (gananciaTotal / capitalInvertido) * 100 : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between bg-neutral-950 px-4 py-4 text-white">
        <h1 className="text-xl font-extrabold">
          Nova<span className="text-blue-500">Market</span> Admin
        </h1>
        <LogoutButton />
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">Capital invertido</p>
            <p className="text-lg font-bold">{formatCOP(capitalInvertido)}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">Ganancia total</p>
            <p className="text-lg font-bold text-emerald-600">{formatCOP(gananciaTotal)}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">ROI</p>
            <p className="text-lg font-bold text-blue-600">{roi.toFixed(1)}%</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">Disponibles</p>
            <p className="text-lg font-bold">{disponibles}</p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Inventario</h2>
          <Link
            href="/admin/nuevo"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Nuevo producto
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">
            Aún no hay productos. Sube tu primera captura para empezar.
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p: any) => (
              <AdminProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
