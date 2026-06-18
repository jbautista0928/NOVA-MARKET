"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const STATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
};

const STATUS_COLORS: Record<string, string> = {
  disponible: "bg-emerald-100 text-emerald-700",
  reservado: "bg-amber-100 text-amber-700",
  vendido: "bg-neutral-200 text-neutral-600",
};

export default function AdminProductCard({ product }: { product: any }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const units = product.units || [];
  const disponibles = units.filter((u: any) => u.status === "disponible").length;
  const vendidos = units.filter((u: any) => u.status === "vendido");
  const gananciaTotal = vendidos.reduce(
    (sum: number, u: any) => sum + ((u.sale_price ?? u.list_price) - u.purchase_price),
    0
  );

  async function updateUnitStatus(unitId: string, status: string) {
    setUpdating(unitId);
    await fetch(`/api/units/${unitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    router.refresh();
  }

  async function deleteProduct() {
    if (!confirm(`¿Eliminar "${product.name}" y todas sus unidades?`)) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start gap-3">
        {product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
            Sin foto
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">{product.name}</h3>
            <button
              onClick={deleteProduct}
              className="text-xs text-red-500 hover:underline"
            >
              Eliminar
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            {product.categories?.name} · {product.provider}
          </p>
          <div className="mt-1 flex gap-3 text-xs">
            <span className="font-semibold text-emerald-600">{disponibles} disponibles</span>
            <span className="text-neutral-400">{units.length} unidades totales</span>
            {gananciaTotal > 0 && (
              <span className="font-semibold text-blue-600">
                Ganancia: {formatCOP(gananciaTotal)}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
      >
        {expanded ? "Ocultar unidades" : "Ver / gestionar unidades"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
          {units.map((u: any) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[u.status]}`}>
                  {STATUS_LABELS[u.status]}
                </span>
                <span className="text-neutral-600">
                  Compra: {formatCOP(u.purchase_price)} · Venta: {formatCOP(u.sale_price ?? u.list_price)}
                </span>
              </div>
              <div className="flex gap-1">
                {Object.keys(STATUS_LABELS)
                  .filter((s) => s !== u.status)
                  .map((s) => (
                    <button
                      key={s}
                      disabled={updating === u.id}
                      onClick={() => updateUnitStatus(u.id, s)}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-white disabled:opacity-50"
                    >
                      Marcar {STATUS_LABELS[s]}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
