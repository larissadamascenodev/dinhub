import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const requestBody = JSON.stringify({
      model: "google/gemini-1.5-flash",
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
    });

    let response: Response | null = null;
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (response.status === 429 && attempt < MAX_RETRIES - 1) {
        const wait = Math.pow(2, attempt + 1) * 1000;
        console.log(`Rate limited, retrying in ${wait}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const status = response?.status ?? 500;
      if (status === 429) {
        return new Response(
          JSON.stringify({ insights: ["⏳ Muitas requisições no momento. Tente novamente em alguns segundos."], alerts: [], limitSuggestions: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ insights: ["Serviço de IA temporariamente indisponível."], alerts: [], limitSuggestions: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = response ? await response.text() : "No response";
      console.error("AI gateway error:", status, t);
      return new Response(
        JSON.stringify({ insights: ["Não foi possível gerar insights no momento."], alerts: [], limitSuggestions: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
