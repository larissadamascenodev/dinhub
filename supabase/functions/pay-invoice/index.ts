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

    const body = await req.json();
    const { invoice_id, account_id, mode = "total", amount_paid, installments, entry_amount } = body;

    if (!invoice_id || !account_id) {
      return new Response(JSON.stringify({ error: "invoice_id and account_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

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

    const totalAmount = Number(invoice.total_amount);
    const alreadyPaid = Number(invoice.paid_amount ?? 0);
    const outstanding = Math.max(0, totalAmount - alreadyPaid);

    if (outstanding <= 0) {
      return new Response(JSON.stringify({ error: "Fatura já está totalmente paga" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: account, error: accError } = await adminClient
      .from("accounts")
      .select("*")
      .eq("id", account_id)
      .eq("user_id", user.id)
      .single();

    if (accError || !account) {
      return new Response(JSON.stringify({ error: "Account not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let debitAmount = outstanding;
    let remainderToNextInvoice = 0;

    if (mode === "minimo") {
      const paid = Number(amount_paid) || 0;
      if (paid <= 0 || paid >= outstanding) {
        return new Response(JSON.stringify({ error: "Valor mínimo deve ser maior que 0 e menor que o saldo devedor" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      debitAmount = paid;
      remainderToNextInvoice = outstanding - paid;
    } else if (mode === "parcelado") {
      const entry = Number(entry_amount) || 0;
      debitAmount = entry;
    }

    const newBalance = Number(account.current_balance) - debitAmount;
    const { error: balError } = await adminClient
      .from("accounts")
      .update({ current_balance: newBalance })
      .eq("id", account_id);

    if (balError) {
      return new Response(JSON.stringify({ error: "Failed to update account balance" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newPaidAmount = alreadyPaid + debitAmount;
    const isFullyPaid = mode === "total" || (mode === "minimo" && remainderToNextInvoice <= 0);

    const { error: payError } = await adminClient
      .from("invoices")
      .update({
        paid_amount: newPaidAmount,
        is_paid: isFullyPaid && newPaidAmount >= totalAmount,
        paid_at: new Date().toISOString(),
        paid_from_account_id: account_id,
      })
      .eq("id", invoice_id);

    if (payError) {
      await adminClient
        .from("accounts")
        .update({ current_balance: account.current_balance })
        .eq("id", account_id);

      return new Response(JSON.stringify({ error: "Failed to mark invoice as paid" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "minimo" && remainderToNextInvoice > 0) {
      let nextMonth = invoice.month + 1;
      let nextYear = invoice.year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }

      const { data: nextInvoiceId } = await adminClient.rpc("get_or_create_invoice", {
        p_credit_card_id: invoice.credit_card_id,
        p_month: nextMonth,
        p_year: nextYear,
        p_user_id: user.id,
      });

      if (nextInvoiceId) {
        const { data: nextInvoice } = await adminClient
          .from("invoices")
          .select("total_amount")
          .eq("id", nextInvoiceId)
          .single();

        if (nextInvoice) {
          await adminClient
            .from("invoices")
            .update({ total_amount: Number(nextInvoice.total_amount) + remainderToNextInvoice })
            .eq("id", nextInvoiceId);
        }
      }
    }

    if (mode === "parcelado") {
      const entry = Number(entry_amount) || 0;
      const numInstallments = Number(installments) || 2;
      const remaining = outstanding - entry;
      const monthlyRate = 0.0199;
      const installmentValue = remaining * (monthlyRate * Math.pow(1 + monthlyRate, numInstallments)) / (Math.pow(1 + monthlyRate, numInstallments) - 1);

      for (let i = 1; i <= numInstallments; i++) {
        let futureMonth = invoice.month + i;
        let futureYear = invoice.year;
        while (futureMonth > 12) {
          futureMonth -= 12;
          futureYear += 1;
        }

        const { data: futureInvoiceId } = await adminClient.rpc("get_or_create_invoice", {
          p_credit_card_id: invoice.credit_card_id,
          p_month: futureMonth,
          p_year: futureYear,
          p_user_id: user.id,
        });

        if (futureInvoiceId) {
          const { data: futureInvoice } = await adminClient
            .from("invoices")
            .select("total_amount")
            .eq("id", futureInvoiceId)
            .single();

          if (futureInvoice) {
            await adminClient
              .from("invoices")
              .update({ total_amount: Number(futureInvoice.total_amount) + installmentValue })
              .eq("id", futureInvoiceId);
          }
        }
      }
    }

    await adminClient.rpc("recalc_credit_card_used_limit", {
      p_credit_card_id: invoice.credit_card_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        invoice_id,
        mode,
        amount_debited: debitAmount,
        new_balance: newBalance,
        remainder: remainderToNextInvoice,
        outstanding_after: outstanding - debitAmount,
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