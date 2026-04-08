import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CategoryInput {
  name: string;
  amount: number;
  percentage: number;
  txCount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { categories, totalExpenses, monthLabel, previousMonthCategories } = await req.json() as {
      categories: CategoryInput[];
      totalExpenses: number;
      monthLabel: string;
      previousMonthCategories: CategoryInput[];
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prevMap = new Map(previousMonthCategories.map((c) => [c.name, c.amount]));

    const catSummary = categories
      .map((c) => {
        const prev = prevMap.get(c.name);
        const change = prev ? Math.round(((c.amount - prev) / prev) * 100) : null;
        return `- ${c.name}: R$ ${c.amount.toFixed(2)} (${c.percentage}% do total, ${c.txCount} transações${change !== null ? `, variação ${change > 0 ? "+" : ""}${change}% vs mês anterior` : ""})`;
      })
      .join("\n");

    const systemPrompt = `Você é o DinHub AI, assistente financeiro pessoal integrado ao app DinHub. 
Fale em português brasileiro informal, tom amigável e leve. Use emojis com moderação.
Seja direto, útil e nunca robótico. Misture humor leve com alertas práticos.
Nunca invente dados — use apenas os números fornecidos.`;

    const userPrompt = `Analise os gastos de ${monthLabel}:

Total gasto: R$ ${totalExpenses.toFixed(2)}

Categorias:
${catSummary}

Gere insights financeiros usando a ferramenta fornecida.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_financial_insights",
              description: "Gera insights, alertas, sugestões de limite e projeções financeiras.",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    description: "2-4 frases curtas, amigáveis e úteis sobre os gastos. Tom humano com humor leve.",
                    items: { type: "string" },
                  },
                  alerts: {
                    type: "array",
                    description: "Alertas de comportamento (ex: aumento vs mês anterior). Só incluir se relevante.",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        message: { type: "string" },
                        severity: { type: "string", enum: ["info", "warning", "danger"] },
                      },
                      required: ["category", "message", "severity"],
                      additionalProperties: false,
                    },
                  },
                  limitSuggestions: {
                    type: "array",
                    description: "Sugestões de limite para categorias com gasto alto (acima de 25% do total).",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        suggestedLimit: { type: "number" },
                        message: { type: "string" },
                      },
                      required: ["category", "suggestedLimit", "message"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights", "alerts", "limitSuggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_financial_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ insights: [], alerts: [], limitSuggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("category-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
