# NovaMarket — Catálogo + Control de Inventario

Aplicación con dos partes:
- **`/` (catálogo público)**: lo que cualquiera ve al abrir el link. Muestra los productos disponibles, organizados por categoría, con foto, precio, y botón de WhatsApp.
- **`/admin` (panel privado)**: donde subes capturas de pantalla de tus compras, la IA extrae los datos, los confirmas, y se guardan. Desde ahí también marcas productos como vendidos.

---

## Antes de empezar: qué necesitas crear

Vas a necesitar 3 cuentas gratuitas. Tómate tu tiempo, no hay apuro.

1. **Supabase** (base de datos + fotos) → https://supabase.com
2. **Vercel** (donde vive la página web) → https://vercel.com
3. **Anthropic Console** (para que la IA lea tus capturas) → https://console.anthropic.com

---

## PASO 1 — Crear el proyecto en Supabase

1. Entra a https://supabase.com y crea una cuenta (puedes usar tu cuenta de Google).
2. Haz clic en **"New Project"**.
3. Ponle de nombre `novamarket`, elige una contraseña para la base de datos (guárdala en un lugar seguro, no la vas a necesitar después pero por si acaso) y elige la región más cercana (ej. `South America (São Paulo)`).
4. Espera 1-2 minutos a que se cree el proyecto.

### 1.1 Crear las tablas de la base de datos

1. En el menú izquierdo, haz clic en **"SQL Editor"**.
2. Haz clic en **"New query"**.
3. Abre el archivo `supabase/schema.sql` que te entregué, copia **todo** su contenido, y pégalo en el editor.
4. Haz clic en **"Run"** (o el botón ▶️). Deberías ver "Success. No rows returned".

### 1.2 Crear el espacio para guardar fotos

1. En el menú izquierdo, haz clic en **"Storage"**.
2. Haz clic en **"New bucket"**.
3. Nombre exacto: `product-images`
4. Activa **"Public bucket"** (para que las fotos se puedan ver en el catálogo).
5. Haz clic en **"Create bucket"**.

### 1.3 Copiar tus llaves (claves de acceso)

1. En el menú izquierdo, haz clic en **"Project Settings"** (el ícono de engranaje) → **"API"**.
2. Vas a ver 3 datos que necesitas copiar y guardar en un lugar temporal (un bloc de notas):
   - **Project URL** → algo como `https://abcxyz.supabase.co`
   - **anon public key** → una clave larga
   - **service_role key** → otra clave larga (¡esta es secreta, no la compartas nunca!)

---

## PASO 2 — Obtener tu llave de Anthropic (Claude API)

1. Entra a https://console.anthropic.com y crea una cuenta o inicia sesión.
2. Ve a **"API Keys"** en el menú.
3. Haz clic en **"Create Key"**, ponle un nombre como `novamarket`.
4. Copia la llave (empieza con `sk-ant-...`) y guárdala junto a las anteriores.
5. Nota: esto tiene un costo de uso, pero es muy bajo — cada captura que proceses cuesta una fracción de centavo. Para tu volumen (decenas de productos al mes) probablemente gastes menos de $1 USD/mes.

---

## PASO 3 — Configurar las variables de entorno

1. Dentro de la carpeta del proyecto, busca el archivo `.env.example`.
2. Haz una copia y renómbrala a `.env.local`.
3. Ábrelo y reemplaza cada valor con lo que copiaste en los pasos anteriores:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
ANTHROPIC_API_KEY=sk-ant-tu-key
ADMIN_PASSWORD=elige-una-contraseña-segura
ADMIN_SESSION_SECRET=cualquier-frase-larga-aleatoria
```

---

## PASO 4 — Subir el proyecto a Vercel

La forma más simple sin usar la terminal:

1. Crea una cuenta en https://vercel.com (puedes entrar con GitHub, Google, o email).
2. Si no tienes cuenta de GitHub, créala en https://github.com (gratis) — Vercel necesita que el código esté ahí.
3. Sube la carpeta de este proyecto a un repositorio nuevo en GitHub (te explico cómo abajo).
4. En Vercel, haz clic en **"Add New" → "Project"**, conecta tu cuenta de GitHub, y selecciona el repositorio `novamarket`.
5. Antes de hacer clic en "Deploy", busca la sección **"Environment Variables"** y agrega ahí las mismas variables que pusiste en `.env.local` (una por una: nombre y valor).
6. Haz clic en **"Deploy"**. Espera 1-2 minutos.
7. Vercel te va a dar un link como `novamarket-xyz.vercel.app` — ¡esa es tu app en vivo!

### Cómo subir el código a GitHub (sin usar comandos)

1. Entra a https://github.com/new, crea un repositorio llamado `novamarket` (puede ser privado).
2. En tu computador, descarga la carpeta completa del proyecto que te compartí.
3. Sigue las instrucciones que GitHub te muestra en la sección "uploading an existing file" (puedes arrastrar y soltar la carpeta completa en la web de GitHub si el proyecto no es muy grande, o usar GitHub Desktop, una app gratuita con interfaz visual: https://desktop.github.com).

---

## PASO 5 — Probar tu aplicación

1. Abre el link de Vercel → deberías ver el catálogo (vacío al principio, eso es normal).
2. Ve a `tu-link.vercel.app/admin` → te va a pedir la contraseña que pusiste en `ADMIN_PASSWORD`.
3. Haz clic en **"+ Nuevo producto"**, sube una captura de prueba, revisa los datos extraídos, ajusta si es necesario, y guarda.
4. Vuelve al catálogo (`/`) y deberías ver tu producto aparecer automáticamente.

---

## Cómo usarlo día a día

- **Para agregar un producto nuevo**: entra a `/admin`, clic en "+ Nuevo producto", sube la captura de la compra (Amazon, Mercado Libre, etc.), revisa los datos, sube 1-3 fotos reales del producto, guarda.
- **Para marcar algo como vendido**: en `/admin`, busca el producto, clic en "Ver/gestionar unidades", y marca la unidad correspondiente como "Vendido".
- **Para compartir el catálogo**: comparte el link principal (`tu-link.vercel.app`) en tu Facebook, WhatsApp, Marketplace, etc. Se actualiza solo cada vez que agregas o vendes algo.

---

## Conectar tu propio dominio (más adelante, opcional)

Cuando quieras usar algo como `novamarket.com` en vez de `.vercel.app`:
1. Compra el dominio donde prefieras (Namecheap, GoDaddy, etc. — unos $10-15 USD/año).
2. En Vercel, ve a tu proyecto → "Settings" → "Domains" → agrega tu dominio.
3. Vercel te da unos registros DNS para pegar en el panel de tu proveedor de dominio. Yo te puedo guiar paso a paso cuando llegues a este punto.
