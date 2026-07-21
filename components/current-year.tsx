"use client";

import { useEffect, useState } from "react";

/**
 * Renders the current calendar year, correcting itself on the client after
 * mount. On statically-rendered pages the server-baked year would otherwise
 * be frozen at build time and go stale after New Year until a redeploy.
 *
 * `fallback` is the build-time year, used for SSR/first paint so there's no
 * layout shift and no hydration mismatch (both sides start from `fallback`).
 */
export function CurrentYear({ fallback }: { fallback: number }) {
  const [year, setYear] = useState(fallback);

  useEffect(() => {
    // One-time sync to the client's real clock. This is the intended use of an
    // effect (reflecting an external value — the wall clock — after mount); it
    // runs once and React bails out if the year is unchanged, so there's no
    // cascade. The lint rule's blanket ban on effect setState doesn't fit here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}
