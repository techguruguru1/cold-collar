import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/shop";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — Cold Collar" },
      {
        name: "description",
        content:
          "Sign in to Cold Collar to save your wishlist and view order history. Guest checkout is always available.",
      },
      { property: "og:title", content: "Sign In — Cold Collar" },
      {
        property: "og:description",
        content: "Access your Cold Collar wishlist and order history.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) void navigate({ to: "/account" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) {
        toast(error.message);
        return;
      }
      if (!data.session) {
        setSent(true);
        return;
      }
      toast("Account created.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        toast(error.message);
        return;
      }
      toast("Welcome back.");
    }
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) {
      setBusy(false);
      toast(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-display text-3xl">{mode === "login" ? "Sign In" : "Create Account"}</h1>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        An account is only needed for your wishlist and order history — checkout is always available
        as a guest.
      </p>

      {sent ? (
        <div className="card-surface mt-8 p-6 text-sm">
          <p className="text-silver">Check your email</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            We sent a confirmation link to {email}. Click it to activate your account, then sign in.
          </p>
        </div>
      ) : (
        <div className="card-surface mt-8 space-y-4 p-6">
          <GoogleSignInButton fallback={() => void signInWithGoogle()} />
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-[11px] uppercase tracking-[0.2em] text-silver">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-[11px] uppercase tracking-[0.2em] text-silver"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-border bg-input px-4 py-3 text-sm outline-none focus:border-silver"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                At least 8 characters. Letters, numbers or both.
              </p>
            </div>
            <button
              disabled={busy}
              type="submit"
              className="btn-silver w-full py-3 text-xs disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="w-full text-center text-xs text-muted-foreground hover:text-silver"
            >
              {mode === "login" ? "No account? Create one" : "Already a member? Sign in"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
