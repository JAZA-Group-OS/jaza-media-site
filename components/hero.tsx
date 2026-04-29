import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-brand-black">
      {/* Diagonal yellow checker (subtle texture). */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(255, 202, 38, 0.04) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255, 202, 38, 0.04) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255, 202, 38, 0.04) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255, 202, 38, 0.04) 75%)
          `,
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 0 14px, 14px -14px, -14px 0",
        }}
        aria-hidden
      />

      {/* Warm yellow radial glow centered behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255, 202, 38, 0.18) 0%, rgba(255, 202, 38, 0.05) 45%, transparent 75%)",
        }}
      />

      {/* Jaza — left flank, lg+ only. Aspect matches the trimmed image exactly
          so object-contain fills the wrapper edge-to-edge (no floating gap). */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 hidden aspect-[6140/6327] w-[24%] max-w-[420px] lg:block xl:w-[28%]"
      >
        <Image
          src="/about-the-form/Jaza%20no%20bg%20trimmed.png"
          alt=""
          fill
          className="object-contain object-bottom object-left"
          sizes="(min-width: 1280px) 28vw, 24vw"
          priority
        />
      </div>

      {/* Bela — right flank, lg+ only. Aspect matches the trimmed image exactly. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 hidden aspect-[6616/6334] w-[24%] max-w-[420px] lg:block xl:w-[28%]"
      >
        <Image
          src="/about-the-form/Bela%20no%20bg%20trimmed.png"
          alt=""
          fill
          className="object-contain object-bottom object-right"
          sizes="(min-width: 1280px) 28vw, 24vw"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 py-8 text-center md:py-10 lg:py-12">
        <h1 className="font-heading text-5xl leading-[1.05] font-black tracking-tight text-white md:text-6xl">
          DO YOU WANT TO
          <br />
          SCALE YOUR BUSINESS?
        </h1>
        <p className="mt-6 max-w-md text-xl text-neutral-300 md:text-2xl">
          Learn from the team that has scaled a portfolio to over ₱150m+ in annual revenue
        </p>
        <a
          href="#"
          className="mt-8 inline-flex items-center rounded-full bg-brand-yellow px-10 py-4 text-xl font-black tracking-wider text-brand-black transition-transform hover:scale-[1.02]"
        >
          LEARN TO SCALE
        </a>
      </div>

      {/* Combined Jaza + Bela cutout — sibling of content so its bottom sits
          flush against the section line on mobile + tablet (lg:hidden). */}
      <div
        aria-hidden
        className="relative z-10 mx-auto w-full max-w-md aspect-[7331/6191] lg:hidden"
      >
        <Image
          src="/about-the-form/JazaBela%20no%20bg%20trimmed.png"
          alt=""
          fill
          className="object-contain object-bottom"
          sizes="(max-width: 1024px) 100vw, 0px"
          priority
        />
      </div>
    </section>
  );
}
