export default function ShippingBanner() {
  return (
    <div className="border-y border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-center sm:gap-6 sm:text-center">
        <p>
          <strong>Bogotá y Soacha:</strong> pago contra entrega, sin costo de envío.
        </p>
        <span className="hidden text-blue-300 sm:inline">•</span>
        <p>
          <strong>Resto del país:</strong> pago contra entrega vía transportadora (ej. Interrapidísimo). El costo de envío lo asume el comprador y varía según la ciudad.
        </p>
      </div>
    </div>
  );
}
