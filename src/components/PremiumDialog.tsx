import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { Sparkles, Volume2, Heart, Zap, Crown, Instagram, Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { redeemCoupon } from "@/lib/premium.functions";
import { useAuthUser } from "@/lib/premium";
import paypalQr from "@/assets/paypal-qr.png";

export const INSTAGRAM_HANDLE = "tokki_easykorean";
export const INSTAGRAM_URL =
  "https://www.instagram.com/tokki_easykorean?igsh=ZG04YWNqcTYzZHBo";

export function PremiumDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuthUser();
  const [code, setCode] = useState("");
  const qc = useQueryClient();
  const redeemFn = useServerFn(redeemCoupon);

  const redeem = useMutation({
    mutationFn: (c: string) => redeemFn({ data: { code: c } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["my-premium"] });
      toast.success(
        res.alreadyPremium ? "You already have Premium 🌸" : "🎉 Premium unlocked! Tap 🔊 to hear Korean.",
      );
      setCode("");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    redeem.mutate(code.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-3xl border-border bg-gradient-to-br from-petal to-blossom/50">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Crown className="h-7 w-7" />
          </div>
          <DialogTitle className="font-display text-2xl font-extrabold">
            Bom Premium <span className="text-primary">🌸</span>
          </DialogTitle>
          <DialogDescription className="text-base text-foreground/80">
            Hear every sentence spoken in natural Korean — train your ear while you read.
          </DialogDescription>
        </DialogHeader>

        <ul className="my-4 space-y-2 text-sm">
          <li className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><b>Pronunciation playback</b> — hear any translation in clear, native-paced Korean.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><b>Listen & repeat</b> — shadowing builds your accent 3× faster.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><b>Unlimited plays</b> — replay any sentence as many times as you want.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><b>Support Tokki</b> — keep this little app sweet and ad-free.</span>
          </li>
        </ul>

        <div className="rounded-2xl bg-card p-4 text-center ring-1 ring-border">
          <p className="font-display text-3xl font-extrabold text-foreground">
            $2 <span className="text-base font-medium text-muted-foreground">/ one-time</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Less than a bubble tea. Yours forever. 🧋</p>
        </div>

        {/* Step 1: Pay */}
        <div className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="text-center font-display text-sm font-bold text-foreground">
            Step 1 · Pay $2 with PayPal
          </p>
          <div className="mt-3 flex justify-center">
            <img
              src={paypalQr}
              alt="PayPal payment QR code"
              className="h-52 w-52 rounded-xl bg-white p-2 ring-1 ring-border"
            />
          </div>
          <p className="mt-3 text-center text-xs text-foreground/80">
            Step 2 · Send the payment screenshot to{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <Instagram className="h-3.5 w-3.5" />
              @{INSTAGRAM_HANDLE}
            </a>
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Step 3 · You'll receive a coupon code — enter it below to unlock Premium.
          </p>
        </div>

        {/* Coupon redemption */}
        <div className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="flex items-center justify-center gap-2 text-center font-display text-sm font-bold text-foreground">
            <Ticket className="h-4 w-4 text-primary" /> Have a coupon code?
          </p>
          <form onSubmit={onRedeem} className="mt-3 flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              maxLength={32}
              className="rounded-full bg-petal text-center font-mono uppercase tracking-widest"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={redeem.isPending || !code.trim()}
              className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {redeem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}
            </Button>
          </form>
          {!user && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              You'll need to{" "}
              <Link to="/auth" className="font-semibold text-primary hover:underline">
                sign in
              </Link>{" "}
              to redeem — it takes a second.
            </p>
          )}
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          One-time payment · No subscription · Instant access after redeeming
        </p>
      </DialogContent>
    </Dialog>
  );
}
