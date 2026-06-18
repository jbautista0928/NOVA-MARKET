export type UnitStatus = "disponible" | "reservado" | "vendido";

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  provider: string | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  product_id: string;
  purchase_price: number;
  list_price: number;
  sale_price: number | null;
  status: UnitStatus;
  purchase_date: string | null;
  arrival_date: string | null;
  sold_date: string | null;
  sold_month: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  product_id: string;
  name: string;
  description: string | null;
  image_urls: string[];
  category_name: string;
  stock_disponible: number;
  stock_reservado: number;
  list_price: number;
  display_price: number;
}

// Lo que la IA extrae de una captura de pantalla antes de
// que el admin confirme/edite y se guarde en la base de datos.
export interface ExtractedProductData {
  product_name: string;
  category_suggestion: string;
  provider: string;
  purchase_price: number | null;
  list_price: number | null;
  quantity: number;
  notes: string | null;
  confidence_notes: string | null; // ej. "No pude leer el precio claramente"
}
