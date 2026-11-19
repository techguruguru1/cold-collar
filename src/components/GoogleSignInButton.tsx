import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GOOGLE_CLIENT_ID } from "@/config/google";

// Google's own sign-in button (Google Identity Services). Sign-in happens in a pop-up that
// starts from this site, so Google shows the site's address instead of the Supabase one.

type CredentialResponse = { credential: string };

type GoogleId = {
  initialize: (opts: {
    client_id: string;
    callback: (res: CredentialResponse) => void;
    nonce: string;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (el: HTMLElement, opts: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let s = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!s) {
      s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
    s.addEventListener("load", () => resolve(), { once: true });
    s.addEventListener("error", () => reject(new Error("Google script failed")), { once: true });
  });
}

async function makeNonce() {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hashed };
}

export function GoogleSignInButton({ fallback }: { fallback: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadScript();
        const { raw, hashed } = await makeNonce();
        const el = ref.current;
        const gid = window.google?.accounts.id;
        if (cancelled || !el || !gid) return;
        gid.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: hashed,
          use_fedcm_for_prompt: true,
          callback: async ({ credential }) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: credential,
              nonce: raw,
            });
            if (error) toast(error.message);
            else toast("Welcome.");
          },
        });
        gid.renderButton(el, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.min(400, Math.max(200, el.offsetWidth)),
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const look =
    "flex h-11 w-full items-center justify-center gap-2 border border-border bg-input text-xs uppercase tracking-[0.2em] text-silver";

  if (failed) {
    return (
      <button type="button" onClick={fallback} className={`${look} hover:border-silver`}>
        <GoogleLogo />
        Continue with Google
      </button>
    );
  }

  // Our plain button is what people see. Google's button sits invisibly on top so the click
  // still opens Google's pop-up, but its "Continue as <name>" text and email never show.
  return (
    <div className="group relative w-full">
      <div aria-hidden="true" className={`${look} group-hover:border-silver`}>
        <GoogleLogo />
        Continue with Google
      </div>
      <div
        ref={ref}
        aria-label="Continue with Google"
        className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.01]"
      />
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
