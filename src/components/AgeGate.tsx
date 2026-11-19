import { useEffect, useState } from "react";

const KEY = "cc_age_ok";

export function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY) !== "yes") setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-4 backdrop-blur-md">
      <div className="card-surface w-full max-w-md p-8 text-center">
        <p className="font-display text-xl tracking-[0.2em] text-brushed">COLD COLLAR</p>
        <h2 className="mt-6 font-display text-2xl">Are you 18 or older?</h2>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          This boutique contains adult lifestyle products. You must confirm you are of legal age to
          enter.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => {
              sessionStorage.setItem(KEY, "yes");
              setShow(false);
            }}
            className="btn-silver flex-1 py-3 text-xs"
          >
            Yes, I am 18+
          </button>
          <button
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
            className="btn-outline-silver flex-1 py-3 text-xs"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
