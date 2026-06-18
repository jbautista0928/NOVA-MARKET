"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fileToBase64 } from "@/lib/file-utils";
import type { ExtractedProductData } from "@/types";

const CATEGORY_OPTIONS = [
  "Tecnología",
  "Moto",
  "Hogar",
  "Juguetes",
  "Ropa",
  "Deporte",
  "Otros",
];

export default function NewProductForm() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Imágenes del producto (capturas o fotos reales para el catálogo)
  const [productImages, setProductImages] = useState<{ base64: string; mediaType: string; preview: string }[]>([]);

  const [form, setForm] = useState<ExtractedProductData & { customCategory: string }>({
    product_name: "",
    category_suggestion: CATEGORY_OPTIONS[0],
    provider: "",
    purchase_price: null,
    list_price: null,
    quantity: 1,
    notes: null,
    confidence_notes: null,
    customCategory: "",
  });

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError("");

    try {
      const { base64, mediaType } = await fileToBase64(file);

      const res = await fetch("/api/extract-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64, media_type: mediaType }),
      });

      if (!res.ok) throw new Error("No se pudo procesar la captura");

      const { data } = await res.json();
      const suggestedCategory = data.category_suggestion || "";
      const isKnown = CATEGORY_OPTIONS.includes(suggestedCategory);

      setForm((prev) => ({
        ...prev,
        product_name: data.product_name || "",
        category_suggestion: isKnown ? suggestedCategory : (CATEGORY_OPTIONS[0]),
        customCategory: isKnown ? "" : suggestedCategory,
        provider: data.provider || "",
        purchase_price: data.purchase_price,
        list_price: data.list_price,
        quantity: data.quantity || 1,
        notes: data.notes,
        confidence_notes: data.confidence_notes,
      }));
      setIsCustomCategory(!isKnown && suggestedCategory !== "");
      setStep("review");
    } catch (err) {
      setError("No pudimos leer la captura. Puedes ingresar los datos manualmente abajo.");
      setStep("review");
    } finally {
      setExtracting(false);
    }
  }

  async function handleProductPhotosUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const { base64, mediaType } = await fileToBase64(file);
      setProductImages((prev) => [
        ...prev,
        { base64, mediaType, preview: `data:${mediaType};base64,${base64}` },
      ]);
    }
  }

  function removeImage(index: number) {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      // 1. Subir todas las fotos del producto a Supabase Storage
      const uploadedUrls: string[] = [];
      for (const img of productImages) {
        const res = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: img.base64, media_type: img.mediaType }),
        });
        if (!res.ok) throw new Error("Error subiendo una de las fotos");
        const { url } = await res.json();
        uploadedUrls.push(url);
      }

      // 2. Crear el producto + N unidades (según quantity)
      const finalCategory = isCustomCategory ? form.customCategory.trim() : form.category_suggestion;

      if (!finalCategory) {
        throw new Error("Debes indicar una categoría");
      }

      const units = Array.from({ length: form.quantity || 1 }, () => ({
        purchase_price: form.purchase_price,
        list_price: form.list_price,
        sale_price: null,
        notes: form.notes,
      }));

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.product_name,
          description: form.notes,
          category_name: finalCategory,
          provider: form.provider,
          image_urls: uploadedUrls,
          units,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Error guardando el producto");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error guardando el producto");
    } finally {
      setSaving(false);
    }
  }

  if (step === "upload") {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
        <p className="mb-4 text-neutral-600">
          Sube la captura de pantalla de la compra (Amazon, Mercado Libre, etc.) y extraemos los datos automáticamente.
        </p>
        <label className="inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
          {extracting ? "Leyendo captura..." : "Subir captura de pantalla"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleScreenshotUpload}
            disabled={extracting}
          />
        </label>

        <div className="mt-4">
          <button
            onClick={() => setStep("review")}
            className="text-sm text-neutral-500 underline hover:text-neutral-700"
          >
            O ingresar los datos manualmente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold">Revisa y confirma los datos</h2>

      {form.confidence_notes && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          ⚠️ {form.confidence_notes}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nombre del producto</label>
          <input
            type="text"
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Categoría</label>
          <select
            value={isCustomCategory ? "__custom__" : form.category_suggestion}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomCategory(true);
              } else {
                setIsCustomCategory(false);
                setForm({ ...form, category_suggestion: e.target.value });
              }
            }}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__custom__">Otra categoría...</option>
          </select>
          {isCustomCategory && (
            <input
              type="text"
              placeholder="Nombre de la nueva categoría"
              value={form.customCategory}
              onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
              className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Proveedor / tienda</label>
          <input
            type="text"
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Precio de compra (COP)</label>
          <input
            type="number"
            value={form.purchase_price ?? ""}
            onChange={(e) => setForm({ ...form, purchase_price: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Precio de venta (COP)</label>
          <input
            type="number"
            value={form.list_price ?? ""}
            onChange={(e) => setForm({ ...form, list_price: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Cantidad de unidades</label>
          <input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 1 })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Notas (color, talla, modelo, etc.)</label>
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500"
            rows={2}
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Fotos para el catálogo (puedes subir varias)
        </label>
        <div className="flex flex-wrap gap-3">
          {productImages.map((img, i) => (
            <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-neutral-200">
              <img src={img.preview} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 text-neutral-400 hover:border-blue-400">
            + Foto
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleProductPhotosUpload} />
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setStep("upload")}
          className="rounded-lg border border-neutral-300 px-5 py-2.5 font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Atrás
        </button>
        <button
          onClick={handleSave}
          disabled={
            saving ||
            !form.product_name ||
            !form.purchase_price ||
            !form.list_price ||
            (isCustomCategory && !form.customCategory.trim())
          }
          className="flex-1 rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar en inventario"}
        </button>
      </div>
    </div>
  );
}
