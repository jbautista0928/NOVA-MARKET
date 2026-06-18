import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaMarket | Catálogo",
  description: "Tecnología, moto, hogar y más a los mejores precios.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
