import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyPremium = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_premium")
      .select("is_premium")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { isPremium: !!data?.is_premium };
  });

export const redeemCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    const code = (input?.code ?? "").trim().toUpperCase();
    if (!code || code.length > 32 || !/^[A-Z0-9]+$/.test(code)) {
      throw new Error("Please enter a valid coupon code.");
    }
    return { code };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check if user is already premium
    const { data: existing } = await supabase
      .from("user_premium")
      .select("is_premium")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing?.is_premium) {
      return { ok: true, alreadyPremium: true };
    }

    // Atomically claim the coupon: RLS only allows updating rows where used_by IS NULL.
    const { data: claimed, error: claimErr } = await supabase
      .from("coupons")
      .update({ used_by: userId, used_at: new Date().toISOString() })
      .eq("code", data.code)
      .is("used_by", null)
      .select("code")
      .maybeSingle();
    if (claimErr) throw new Error(claimErr.message);
    if (!claimed) {
      throw new Error("Invalid or already-used coupon code.");
    }

    // Grant premium
    const { error: upsertErr } = await supabase
      .from("user_premium")
      .upsert(
        { user_id: userId, is_premium: true, granted_via: `coupon:${data.code}` },
        { onConflict: "user_id" },
      );
    if (upsertErr) throw new Error(upsertErr.message);

    return { ok: true, alreadyPremium: false };
  });
