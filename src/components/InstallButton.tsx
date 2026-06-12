import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { toast } from "sonner";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      localStorage.getItem("bom_installed") === "1";
    if (isStandalone) setInstalled(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      localStorage.setItem("bom_installed", "1");
      setInstalled(true);
      setDeferred(null);
      toast.success("Added to your home screen 🌸");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("bom_installed", "1");
        setInstalled(true);
      }
      setDeferred(null);
      return;
    }
    // Fallback: explain how to add manually
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    toast(
      isIOS
        ? "Tap the Share button in Safari, then 'Add to Home Screen' 🌸"
        : "Open your browser menu and tap 'Install app' or 'Add to Home screen' 🌸",
      { duration: 6000 },
    );
  };

  if (installed) {
    return (
      <Button variant="outline" size="sm" disabled className="rounded-full">
        <Check className="mr-1.5 h-3.5 w-3.5" /> Added
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className="rounded-full border-primary/40 bg-card/70 text-foreground hover:bg-petal"
    >
      <Download className="mr-1.5 h-3.5 w-3.5" /> Add to homepage
    </Button>
  );
}
