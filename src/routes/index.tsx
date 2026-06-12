import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Translator } from "@/components/Translator";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/InstallButton";
import { useAuthUser } from "@/lib/premium";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bom — Learn Korean Sweetly" },
      {
        name: "description",
        content:
          "Translate English to Korean and tap the rabbit to see grammar, sentence structure, and word-by-word breakdowns.",
      },
      { property: "og:title", content: "Bom — Learn Korean Sweetly" },
      {
        property: "og:description",
        content:
          "Sweet, friendly Korean learning. Translate, then ask Bom-Bunny how the sentence works.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between gap-2">
        <InstallButton />
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.email}
              </span>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
              </Button>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/auth">
                <LogIn className="mr-1.5 h-3.5 w-3.5" /> Sign in
              </Link>
            </Button>
          )}
        </div>
      </div>

      <header className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-border backdrop-blur-sm">
          <span>🌸</span> Bom · 봄 · Spring of Korean
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Learn Korean,{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            sweetly.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Type anything in English, get a natural Korean translation, then tap
          the little 🐰 to see exactly how the sentence is built — particles,
          word order, and all.
        </p>
      </header>

      <Translator />

      <footer className="mx-auto mt-16 max-w-3xl space-y-2 text-center text-xs text-muted-foreground">
        <p>Made with 🌸 — practice a sentence a day, fighting! 화이팅!</p>
        <p>
          Made by{" "}
          <a
            href="https://www.instagram.com/tokki_easykorean?igsh=ZG04YWNqcTYzZHBo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            @tokki_easykorean
          </a>
        </p>
      </footer>
      <Toaster />
    </main>
  );
}
