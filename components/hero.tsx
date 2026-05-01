import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-brand-black">
      {/* Jaza — left flank, md+ (iPad and up). Smaller footprint at md, grows at lg/xl. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 hidden aspect-square w-[20%] max-w-[340px] md:block lg:w-[21%] xl:w-[22%]"
      >
        <Image
          src="/about-the-form/Jaza%20no%20bg%20trimmed.png"
          alt=""
          fill
          className="object-contain object-bottom object-left"
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 21vw, (min-width: 768px) 20vw, 0px"
          priority
        />
      </div>

      {/* Bela — right flank, md+ (iPad and up). object-cover so her image fills
          the wrapper edge-to-edge (eliminates the small residual gap between
          her body and the section line). */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 hidden aspect-square w-[20%] max-w-[340px] md:block lg:w-[21%] xl:w-[22%]"
      >
        <Image
          src="/about-the-form/Bela%20no%20bg%20trimmed.png"
          alt=""
          fill
          className="object-cover object-bottom object-right"
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 21vw, (min-width: 768px) 20vw, 0px"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-6 py-8 text-center md:py-10 lg:max-w-4xl lg:py-12">
        <h1 className="font-heading text-[44px] leading-[1.05] font-black tracking-tight text-white md:text-5xl lg:text-[50px]">
          DO YOU WANT TO
          <br />
          SCALE YOUR BUSINESS?
        </h1>
        <p className="font-heading mt-6 max-w-lg text-lg text-neutral-300 md:text-xl">
          Learn from the team that has scaled a portfolio to over ₱150m+ in annual revenue
        </p>
        <Link
          href="/partner-with-us"
          className="mt-8 inline-flex items-center rounded-full bg-brand-yellow px-10 py-4 text-base font-black tracking-wider text-brand-black transition-transform hover:scale-[1.02] md:text-lg"
        >
          LEARN TO SCALE
        </Link>

        {/* Combined Jaza + Bela cutout — mobile only (below md). Negative bottom
            margin absorbs the content div's bottom padding so the photo sits
            flush against the section line. */}
        <div
          aria-hidden
          className="relative mt-8 -mb-8 aspect-[7331/6191] w-full max-w-md md:hidden"
        >
          <Image
            src="/about-the-form/JazaBela%20no%20bg%20trimmed.png"
            alt=""
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 768px) 100vw, 0px"
            priority
          />
        </div>
      </div>
    </section>
  );
}
