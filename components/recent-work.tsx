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
  {
    src: "/videos/monthly-graphics-package.mp4",
    poster: "/videos/monthly-graphics-package.jpg",
    tag: "Design · Monthly Package",
    title: "A month of scroll-stoppers.",
    copy: "Fresh, on-brand graphics delivered every month — so your feed never goes quiet and never looks ordinary.",
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
        <div className="relative overflow-hidden rounded-[1.5rem] bg-black shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] transition duration-500 group-hover:shadow-[0_30px_70px_-26px_rgba(0,0,0,0.45)]">
          <video
            ref={ref}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="auto"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onClick={togglePlay}
            className="aspect-[4/5] w-full cursor-pointer object-cover"
            aria-label={`${tag} — ${title}`}
          />
          <span className="absolute top-4 left-4 rounded-full bg-[#FFC400] px-3.5 py-1.5 text-[10px] font-bold tracking-[0.12em] text-ink uppercase shadow-[0_4px_12px_-4px_rgba(0,0,0,0.35)]">
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
      <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-[13px] leading-relaxed text-ink/70">{copy}</p>
    </article>
  );
}

export function RecentWork() {
  return (
    <section id="recent-work" className="home-slide relative overflow-hidden md:flex md:min-h-[calc(100svh-114px)] md:flex-col md:justify-center bg-[#FAF8F3] py-12 text-ink md:py-12">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[340px] w-[520px] -rotate-[20deg] rounded-[50%] bg-gradient-to-br from-[#FFC400] to-[#FFD84D] opacity-90" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-[300px] w-[520px] -rotate-[20deg] rounded-[50%] bg-gradient-to-tl from-[#FFC400] to-[#FFD84D] opacity-90" />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-bold tracking-[0.32em] text-ink/70">
            RECENT OUTPUT
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold leading-[1.1] md:text-[44px]">
            Ads people <span className="text-[#FFC400]">stop</span> for.
            <br className="hidden md:block" /> Brands people <span className="text-[#FFC400]">buy</span> from.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/75">
            Every frame is engineered to win the scroll and close the sale. Here&apos;s a taste of what we&apos;re
            shipping for brands right now.
          </p>
        </Reveal>

        <div className="mx-auto mt-8 grid max-w-[340px] gap-10 sm:max-w-[720px] sm:grid-cols-2 md:mt-8 md:gap-8 lg:max-w-[min(1080px,calc((100svh-580px)*2.4+64px))] lg:grid-cols-3">
          {WORKS.map((w, i) => (
            <Reveal key={w.src} className={i === 2 ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-1rem)] lg:col-span-1 lg:w-auto" : ""}>
              <WorkVideo {...w} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-6 md:mt-10">
          <p className="font-serif text-xl md:text-2xl">
            Your brand could be <span className="text-[#FFC400]">next</span>.
          </p>
          <Link
            href="/partner-with-us"
            className="inline-flex items-center gap-2 rounded-full bg-[#FFC400] px-7 py-3.5 text-sm font-semibold tracking-wider text-black uppercase shadow-[0_10px_30px_-8px_rgba(255,196,0,0.6)] transition hover:bg-[#FFD23F]"
          >
            Make my ad <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
