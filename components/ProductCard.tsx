"use client";

import { useState } from "react";
import Image from "next/image";
import type { CatalogItem } from "@/types";

const WHATSAPP_NUMBER = "573133940435"; // +57 313 394 0435

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductCard({ item }: { item: CatalogItem }) {
  const [imgIndex, setImgIndex] = useState(0);
  const hasDiscount = item.display_price < item.list_price;
  const images = item.image_urls.length > 0 ? item.image_urls : null;

  const waMessage = encodeURIComponent(
    `Hola NovaMarket! Me interesa "${item.name}" (${formatCOP(item.display_price)}). ¿Sigue disponible?`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-square bg-neutral-100">
        {images ? (
          <Image
            src={images[imgIndex]}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400 text-sm">
            Sin foto
          </div>
        )}

        {item.stock_disponible <= 2 && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
            ¡Últimas {item.stock_disponible}!
          </span>
        )}

        {images && images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === imgIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
          {item.category_name}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
          {item.name}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-neutral-900">
            {formatCOP(item.display_price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {formatCOP(item.list_price)}
            </span>
          )}
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-1.758-.879-2.91-1.567-4.067-3.553-.308-.529.308-.49.882-1.629.097-.196.05-.367-.05-.513-.097-.149-.673-1.62-.923-2.156-.247-.534-.5-.461-.673-.461-.171 0-.367-.034-.566-.034-.196 0-.516.075-.785.366-.27.295-1.04 1.016-1.04 2.479 0 1.462 1.061 2.875 1.21 3.074.149.195 2.061 3.146 5.001 4.282 2.943 1.135 2.943.756 3.477.706.534-.05 1.766-.722 2.013-1.426.249-.703.249-1.306.172-1.426-.074-.119-.272-.196-.572-.345z" />
            <path d="M12.05 0C5.516 0 .227 5.291.227 11.825c0 2.118.554 4.103 1.521 5.821L0 24l6.488-1.711a11.741 11.741 0 005.561 1.412h.005c6.534 0 11.823-5.291 11.823-11.825C23.877 5.291 18.588.005 12.05 0zm6.838 18.638a9.86 9.86 0 01-6.84 2.795h-.004a9.821 9.821 0 01-5.034-1.376l-.36-.214-3.738.983.996-3.642-.235-.374a9.793 9.793 0 01-1.5-5.234c0-5.434 4.43-9.86 9.879-9.86a9.806 9.806 0 016.985 2.892 9.799 9.799 0 012.89 6.974c.002 5.434-4.426 9.86-9.04 9.06l.001-.004z" />
          </svg>
          Preguntar por WhatsApp
        </a>
      </div>
    </div>
  );
}
