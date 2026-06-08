import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setPremium } from "@/lib/premium";
import { Sparkles, Volume2, Heart, Zap, Crown } from "lucide-react";
import { toast } from "sonner";

export function PremiumDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const handleUnlock = () => {
    // TODO: replace with real Stripe checkout. For now, simulate purchase.
    setPremium(true);
    onOpenChange(false);
    toast.success("🎉 Welcome to Bom Premium! Tap 🔊 to hear Korean.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-gradient-to-br from-petal to-blossom/50">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Crown className="h-7 w-7" />
          </div>
          <DialogTitle className="font-display text-2xl font-extrabold">
            Bom Premium <span className="text-primary">🌸</span>
          </DialogTitle>
          <DialogDescription className="text-base text-foreground/80">
            Hear every sentence spoken aloud in natural Korean — train your ear while you read.
          </DialogDescription>
        </DialogHeader>

        <ul className="my-4 space-y-3 text-sm">
          <li className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><b>Pronunciation playback</b> — tap to hear any translation in clear, native-paced Korean.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><b>Listen & repeat</b> — shadowing builds your accent 3× faster than reading alone.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><b>Unlimited plays</b> — replay any sentence as many times as you want, no daily limit.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-card/70 p-3 ring-1 ring-border">
            <Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span><b>Support Bom-Bunny</b> — keep this little app sweet, ad-free, and growing.</span>
          </li>
        </ul>

        <div className="rounded-2xl bg-card p-4 text-center ring-1 ring-border">
          <p className="font-display text-3xl font-extrabold text-foreground">
            $2 <span className="text-base font-medium text-muted-foreground">/ one-time</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Less than a bubble tea. Yours forever. 🧋</p>
        </div>

        <Button
          onClick={handleUnlock}
          size="lg"
          className="mt-4 w-full rounded-full bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90"
        >
          <Crown className="mr-2 h-4 w-4" /> Unlock Premium — $2
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Secure one-time payment · No subscription · Instant access
        </p>
      </DialogContent>
    </Dialog>
  );
}
