import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the invoice
    const { data: invoice, error: invError } = await adminClient
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .eq("user_id", user.id)
      .single();

    if (invError || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paidAmount = Number(invoice.paid_amount ?? 0);
    if (paidAmount <= 0) {
      return new Response(JSON.stringify({ error: "Fatura não possui pagamento registrado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Restore account balance
    if (invoice.paid_from_account_id) {
      const { data: account } = await adminClient
        .from("accounts")
        .select("current_balance")
        .eq("id", invoice.paid_from_account_id)
        .single();

      if (account) {
        const restoredBalance = Number(account.current_balance) + paidAmount;
        await adminClient
          .from("accounts")
          .update({ current_balance: restoredBalance })
          .eq("id", invoice.paid_from_account_id);
      }
    }

    // Reset invoice payment fields
    await adminClient
      .from("invoices")
      .update({
        paid_amount: 0,
        is_paid: false,
        paid_at: null,
        paid_from_account_id: null,
      })
      .eq("id", invoice_id);

    // Recalculate credit card used limit
    await adminClient.rpc("recalc_credit_card_used_limit", {
      p_credit_card_id: invoice.credit_card_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        invoice_id,
        amount_restored: paidAmount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
