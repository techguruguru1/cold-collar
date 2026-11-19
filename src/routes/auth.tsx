import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/shop";

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
        <form onSubmit={submit} className="card-surface mt-8 space-y-4 p-6">
          <button
            type="button"
            disabled={busy}
            onClick={() => void signInWithGoogle()}
            className="flex w-full items-center justify-center gap-2 border border-border bg-input py-3 text-xs uppercase tracking-[0.2em] text-silver hover:border-silver disabled:opacity-60"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z"
              />
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
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
      )}
    </div>
  );
}
