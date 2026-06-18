import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdminSession } from "@/lib/auth";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORY_HINTS = [
  "Tecnología",
  "Moto",
  "Hogar",
  "Juguetes",
  "Ropa",
  "Deporte",
  "Otros",
];

const SYSTEM_PROMPT = `Eres un asistente que extrae datos de capturas de pantalla de compras (Amazon, Mercado Libre, Xiaomi App, Auteco, Jumbo, Falabela, Temu, AliExpress, etc.) para un negocio de reventa llamado NovaMarket.

Devuelve SOLAMENTE un objeto JSON (sin texto adicional, sin markdown, sin backticks) con esta forma exacta:

{
  "product_name": string,            // nombre claro y corto del producto, ej. "Smartband Xiaomi Smart Band 9"
  "category_suggestion": string,      // una categoría. Usa una de estas si aplica: ${CATEGORY_HINTS.join(", ")}. Si ninguna aplica bien, propone una nueva categoría corta y clara.
  "provider": string,                 // tienda o plataforma donde se compró, ej. "Amazon", "Mercado Libre", "Xiaomi App"
  "purchase_price": number | null,    // precio que se pagó, en pesos colombianos (COP), solo el número sin símbolos
  "list_price": number | null,        // precio de lista/sugerido de venta si es identificable en la imagen, sino null
  "quantity": number,                 // cuántas unidades se compraron según la captura (default 1 si no es claro)
  "notes": string | null,             // cualquier detalle relevante: color, talla, modelo, características
  "confidence_notes": string | null   // si algo no se pudo leer con certeza, explícalo aquí brevemente. Si todo está claro, usa null.
}

Reglas:
- Si la imagen no es claramente un comprobante o página de compra, dilo en confidence_notes pero igual intenta extraer lo que puedas.
- No inventes precios: si no son legibles, usa null.
- Los precios deben ser números en pesos colombianos (sin puntos, comas ni símbolo $), ej. 42000 no "42.000" ni "$42,000".`;

export async function POST(req: NextRequest) {
  const authError = await requireAdminSession(req);
  if (authError) return authError;

  try {
    const { image_base64, media_type } = await req.json();

    if (!image_base64 || !media_type) {
      return NextResponse.json(
        { error: "Falta image_base64 o media_type" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type,
                data: image_base64,
              },
            },
            {
              type: "text",
              text: "Extrae los datos de este producto según el formato indicado.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "La IA no devolvió texto" },
        { status: 502 }
      );
    }

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ data: parsed });
  } catch (err) {
    console.error("Error extrayendo producto:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la imagen. Intenta de nuevo o ingresa los datos manualmente." },
      { status: 500 }
    );
  }
}
