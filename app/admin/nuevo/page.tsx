import Link from "next/link";
import NewProductForm from "@/components/NewProductForm";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← Volver al inventario
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Nuevo producto</h1>
      <NewProductForm />
    </div>
  );
}
