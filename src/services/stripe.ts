import { supabase } from "@/integrations/supabase/client";

export const createStripeCheckout = async ({
  priceId,
  userId,
  userEmail,
  userName,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  userEmail: string;
  userName: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        userId,
        userEmail,
        userName,
        successUrl,
        cancelUrl,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error("Error creating checkout session:", err);
    throw err;
  }
};
