"use client";

import { ArrowRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/reveal";

const WORKS = [
  {
    src: "/videos/skincare-sales-ad.mp4",
    poster: "/videos/skincare-sales-ad.jpg",
    tag: "Skincare · Sales Ad",
    title: "Luxury that sells itself.",
    copy: "A high-end beauty spot built to stop the scroll and move product — premium visuals, zero filler.",
  },
  {
    src: "/videos/how-we-grow-your-sales.mp4",
    poster: "/videos/how-we-grow-your-sales.jpg",
    tag: "Agency · Growth Ad",
    title: "Attention, turned into revenue.",
    copy: "Our own playbook in 30 seconds — how we plan, create and scale ads that bring buyers, not just likes.",
  },
];

function WorkVideo({ src, poster, tag, title, copy }: (typeof WORKS)[number]) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Plays muted while on screen, pauses when scrolled away.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.45 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    // only one video talks at a time
    if (v.muted) document.querySelectorAll<HTMLVideoElement>("#recent-work video").forEach((o) => o !== v && (o.muted = true));
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => {});
  };

  return (
    <article className="group">
      <div className="relative">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-b from-[#FFC400]/70 via-[#FFC400]/10 to-white/5 transition-opacity duration-500 group-hover:opacity-100 md:opacity-60" />
        <div className="relative overflow-hidden rounded-[2rem] bg-black shadow-[0_40px_90px_-30px_rgba(255,196,0,0.35)]">
          <video
            ref={ref}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onClick={togglePlay}
            className="aspect-[4/5] w-full cursor-pointer object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            aria-label={`${tag} — ${title}`}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
          <span className="absolute top-4 left-4 rounded-full border border-[#FFC400]/40 bg-black/60 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-[#FFC400] uppercase backdrop-blur">
            {tag}
          </span>
          <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
              className="grid size-11 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-[#FFC400] hover:text-black"
            >
              {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-px" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Turn sound on" : "Mute"}
              className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-[#FFC400] hover:text-black"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              {muted ? "Tap for sound" : "Sound on"}
            </button>
          </div>
        </div>
      </div>
      <h3 className="mt-6 font-serif text-2xl md:text-[1.7rem]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">{copy}</p>
    </article>
  );
}

export function RecentWork() {
  return (
    <section id="recent-work" className="relative overflow-hidden bg-ink py-20 text-white md:py-28">
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,196,0,0.10),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.3em] text-white/80">
            <span className="size-1.5 animate-pulse rounded-full bg-[#FFC400]" /> RECENT OUTPUT
          </p>
          <h2 className="mt-6 font-serif text-4xl leading-[1.1] md:text-6xl">
            Ads people <span className="text-[#FFC400]">stop</span> for.
            <br className="hidden md:block" /> Brands people <span className="text-[#FFC400]">buy</span> from.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-white/65 md:text-lg">
            Every frame is engineered to win the scroll and close the sale. Here&apos;s a taste of what we&apos;re
            shipping for brands right now.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-12 md:mt-20 md:grid-cols-2 md:gap-10">
          {WORKS.map((w, i) => (
            <Reveal key={w.src} className={i === 1 ? "md:mt-16" : ""}>
              <WorkVideo {...w} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 flex flex-col items-center gap-4 text-center md:mt-20">
          <p className="font-serif text-xl md:text-2xl">
            Your brand could be <span className="text-[#FFC400]">next</span>.
          </p>
          <Link
            href="/partner-with-us"
            className="inline-flex items-center gap-2 rounded-full bg-[#FFC400] px-8 py-4 text-sm font-semibold tracking-wider text-black uppercase shadow-[0_10px_30px_-8px_rgba(255,196,0,0.6)] transition hover:bg-[#FFD23F]"
          >
            Make my ad <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
