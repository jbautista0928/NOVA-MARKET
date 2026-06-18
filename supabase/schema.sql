-- ============================================================
-- NOVAMARKET - Esquema de base de datos
-- Ejecutar esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Tabla: categories
-- Categorías del catálogo. Empieza con una lista base, pero
-- la IA o el admin pueden crear nuevas en cualquier momento.
-- ------------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into categories (name) values
  ('Tecnología'),
  ('Moto'),
  ('Hogar'),
  ('Juguetes'),
  ('Ropa'),
  ('Deporte'),
  ('Otros');

-- ------------------------------------------------------------
-- Tabla: products
-- Un "producto" agrupa la info compartida entre unidades
-- iguales (ej. "Maletero cuadrado para moto"). Las fotos y
-- la categoría viven aquí. El precio/estado vive en "units".
-- ------------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  provider text,                  -- ej. "Amazon", "Mercado Libre", "Xiaomi App", "Auteco"
  image_urls text[] not null default '{}',  -- URLs en Supabase Storage
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products(category_id);

-- ------------------------------------------------------------
-- Tabla: units
-- Cada unidad física comprada es su propio registro,
-- igual que en el Excel original (fila por fila).
-- ------------------------------------------------------------
create type unit_status as enum ('disponible', 'reservado', 'vendido');

create table units (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  purchase_price numeric(12,2) not null,
  list_price numeric(12,2) not null,        -- precio normal / de lista
  sale_price numeric(12,2),                 -- precio de oferta (si aplica), o precio real de venta una vez vendido
  status unit_status not null default 'disponible',
  purchase_date date,
  arrival_date date,
  sold_date date,
  sold_month text,                          -- se mantiene por compatibilidad con tu Excel ("Diciembre", "Enero"...)
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_units_product on units(product_id);
create index idx_units_status on units(status);

-- Columna calculada de ganancia (no se guarda, se calcula al consultar)
create view units_with_profit as
select
  u.*,
  case
    when u.status = 'vendido' and u.sale_price is not null
      then u.sale_price - u.purchase_price
    else null
  end as profit,
  case
    when u.status = 'vendido' and u.sale_price is not null and u.purchase_price > 0
      then round(((u.sale_price - u.purchase_price) / u.purchase_price) * 100, 2)
    else null
  end as profit_percent
from units u;

-- ------------------------------------------------------------
-- Vista: catalog_view
-- Lo que el catálogo público realmente consulta: solo
-- productos con al menos 1 unidad disponible o reservada,
-- con conteo de stock y precio mínimo disponible.
-- ------------------------------------------------------------
create view catalog_view as
select
  p.id as product_id,
  p.name,
  p.description,
  p.image_urls,
  c.name as category_name,
  count(u.id) filter (where u.status = 'disponible') as stock_disponible,
  count(u.id) filter (where u.status = 'reservado') as stock_reservado,
  min(u.list_price) filter (where u.status in ('disponible','reservado')) as list_price,
  min(coalesce(u.sale_price, u.list_price)) filter (where u.status in ('disponible','reservado')) as display_price
from products p
join categories c on c.id = p.category_id
join units u on u.product_id = p.id
group by p.id, p.name, p.description, p.image_urls, c.name
having count(u.id) filter (where u.status in ('disponible','reservado')) > 0;

-- ------------------------------------------------------------
-- Trigger: updated_at automático
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

create trigger trg_units_updated_at
before update on units
for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- Seguridad (RLS): el catálogo público solo puede LEER vía
-- las vistas/tablas necesarias. Escritura solo con la
-- service_role key (usada en el backend del admin, nunca
-- expuesta al navegador).
-- ------------------------------------------------------------
alter table products enable row level security;
alter table units enable row level security;
alter table categories enable row level security;

create policy "Lectura pública de categorías"
  on categories for select using (true);

create policy "Lectura pública de productos"
  on products for select using (true);

create policy "Lectura pública de unidades"
  on units for select using (true);

-- No se crean policies de insert/update/delete: solo la
-- service_role key (que ignora RLS) puede escribir, y esa
-- key solo vive en el servidor (panel admin), nunca en el navegador.
