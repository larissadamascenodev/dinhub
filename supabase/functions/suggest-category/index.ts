import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXPENSE_CATEGORIES = [
  "Alimentação", "Transporte", "Saúde", "Assinaturas",
  "Lazer", "Moradia", "Educação", "Vestuário", "Outros",
];

const INCOME_CATEGORIES = [
  "Salário", "Freelance", "Investimentos", "Outros",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const categories = type === "receita" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You categorize financial transactions. Given a description, return the most likely category from this list: ${categories.join(", ")}. Return ONLY the category name, nothing else.`,
          },
          {
            role: "user",
            content: description,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_category",
              description: "Suggest a category for the transaction",
              parameters: {
                type: "object",
                properties: {
                  category: { type: "string", enum: categories },
                },
                required: ["category"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_category" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ category: null }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ category: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let category = null;

    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (categories.includes(args.category)) {
          category = args.category;
        }
      } catch {}
    }

    return new Response(JSON.stringify({ category }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-category error:", e);
    return new Response(JSON.stringify({ category: null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
