"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[55vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md py-16">
        <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-surface-raised border border-line flex items-center justify-center text-xl">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-floodlight font-display">
          Something went wrong
        </h1>
        <p className="text-sm text-mist mt-2 leading-relaxed">
          This page hit an unexpected error. The rest of the site is unaffected —
          you can try again or keep browsing.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => reset()}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-club-accent text-white hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-line text-mist hover:text-floodlight transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
