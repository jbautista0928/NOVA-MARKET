"use client";

import { useMemo, useState } from "react";
import type { CatalogItem } from "@/types";
import ProductCard from "./ProductCard";

export default function CatalogGrid({ items }: { items: CatalogItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category_name));
    return ["Todos", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === "Todos") return items;
    return items.filter((i) => i.category_name === activeCategory);
  }, [items, activeCategory]);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto px-4 py-4 sm:flex-wrap sm:justify-center sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeCategory === cat
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-blue-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-16 text-center text-neutral-500">
          No hay productos disponibles en esta categoría por ahora.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-12 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <ProductCard key={item.product_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
