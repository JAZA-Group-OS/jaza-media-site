export function CopyrightBar() {
  return (
    <div className="w-full bg-brand-yellow py-3">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs font-bold text-brand-black md:flex-row md:text-sm">
        <p>JAZA Media © {new Date().getFullYear()}. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="/privacy" className="underline-offset-2 hover:underline">
            Privacy Policy
          </a>
          <span aria-hidden className="opacity-50">·</span>
          <a href="/terms" className="underline-offset-2 hover:underline">
            Terms &amp; Conditions
          </a>
        </div>
      </div>
    </div>
  );
}
