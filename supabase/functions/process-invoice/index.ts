import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ExtractedItem {
  description: string;
  amount: number;
  date: string | null;
  installment_current: number | null;
  installment_total: number | null;
  category: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contentType = req.headers.get("content-type") || "";

    let imageBase64: string | null = null;
    let mimeType = "image/png";
    let csvText: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) throw new Error("No file provided");

      const fileName = file.name.toLowerCase();
      const fileType = file.type;

      if (fileName.endsWith(".csv") || fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
        // CSV/spreadsheet: read as text
        csvText = await file.text();
      } else {
        // Image or PDF: convert to base64
        const buffer = await file.arrayBuffer();
        imageBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        mimeType = fileType || (fileName.endsWith(".pdf") ? "application/pdf" : "image/png");
      }
    } else {
      const body = await req.json();
      if (body.image_base64) {
        imageBase64 = body.image_base64;
        mimeType = body.mime_type || "image/png";
      } else if (body.csv_text) {
        csvText = body.csv_text;
      } else {
        throw new Error("No file or data provided");
      }
    }

    const systemPrompt = `Você é um assistente especializado em extrair transações de faturas de cartão de crédito brasileiras.

Analise o conteúdo fornecido e extraia TODAS as transações/lançamentos.

Para cada item extraído, retorne:
- description: nome/descrição da compra
- amount: valor em reais (número decimal, sem R$)
- date: data da compra no formato YYYY-MM-DD (ou null se não disponível)
- installment_current: número da parcela atual (ex: se "3/10", retorne 3). null se não parcelado
- installment_total: total de parcelas (ex: se "3/10", retorne 10). null se não parcelado
- category: categoria sugerida (alimentação, transporte, compras, saúde, educação, lazer, moradia, serviços, assinatura, outros)

REGRAS DE DETECÇÃO DE PARCELAMENTO:
- Procure padrões como: "3/10", "03/10", "Parcela 3 de 10", "3x de 10", "PARC 03/10"
- Se encontrar, extraia installment_current e installment_total
- Se NÃO encontrar indicação de parcelamento, deixe ambos como null

IMPORTANTE: Retorne APENAS o JSON, sem markdown, sem explicação.
Formato: { "items": [...] }`;

    let userContent: any[];

    if (csvText) {
      userContent = [
        {
          type: "text",
          text: `Extraia as transações desta fatura em formato CSV/planilha:\n\n${csvText}`,
        },
      ];
    } else {
      userContent = [
        {
          type: "text",
          text: "Extraia todas as transações desta fatura de cartão de crédito. Identifique parcelamentos.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
          },
        },
      ];
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("Falha ao processar fatura com IA");
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";

    // Clean up potential markdown wrapping
    rawContent = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed: { items: ExtractedItem[] };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      throw new Error("Não foi possível interpretar a fatura. Tente com uma imagem mais nítida.");
    }

    if (!parsed.items || !Array.isArray(parsed.items)) {
      throw new Error("Nenhuma transação encontrada na fatura.");
    }

    // Validate and clean items
    const cleanedItems: ExtractedItem[] = parsed.items
      .filter((item) => item.description && item.amount > 0)
      .map((item) => ({
        description: String(item.description).trim(),
        amount: Math.round(Number(item.amount) * 100) / 100,
        date: item.date || null,
        installment_current: item.installment_current ? Number(item.installment_current) : null,
        installment_total: item.installment_total ? Number(item.installment_total) : null,
        category: item.category || "outros",
      }));

    // Generate micro-interaction messages
    const hasInstallments = cleanedItems.some((i) => i.installment_total && i.installment_total > 1);
    const totalItems = cleanedItems.length;
    const installmentItems = cleanedItems.filter((i) => i.installment_total && i.installment_total > 1);

    let message = `${totalItems} lançamento${totalItems > 1 ? "s" : ""} encontrado${totalItems > 1 ? "s" : ""} 🎯`;
    if (hasInstallments) {
      const msgs = [
        `Detectamos ${installmentItems.length} parcelamento${installmentItems.length > 1 ? "s" : ""}… clássico 😅`,
        `${installmentItems.length} parcelado${installmentItems.length > 1 ? "s" : ""} encontrado${installmentItems.length > 1 ? "s" : ""}. Relaxa, tá sob controle 👀`,
        `Parcelou né? Encontramos ${installmentItems.length} 😏`,
      ];
      message = msgs[Math.floor(Math.random() * msgs.length)];
    }

    return new Response(
      JSON.stringify({
        items: cleanedItems,
        message,
        total_items: totalItems,
        installment_items: installmentItems.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("process-invoice error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
