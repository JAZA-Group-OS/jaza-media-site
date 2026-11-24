import Link from "next/link";

import { CurrentYear } from "@/components/current-year";

export function CopyrightBar() {
  // Build-time year as the SSR fallback; CurrentYear corrects it on the client.
  const buildYear = new Date().getFullYear();

  return (
    <div className="w-full border-t border-white/10 bg-ink py-5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-white/50 md:flex-row md:text-sm">
        <p>
          JAZA Media © <CurrentYear fallback={buildYear} />. All rights
          reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          <span aria-hidden className="opacity-50">
            ·
          </span>
          <Link href="/terms" className="underline-offset-2 hover:underline">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
