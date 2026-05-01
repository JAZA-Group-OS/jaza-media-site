import Image from "next/image";
import Link from "next/link";

export function ExplodeProfitCta() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="relative min-h-[440px] max-[374px]:min-h-[400px] md:min-h-[500px]">
          <div className="pointer-events-none absolute -bottom-8 -left-6 z-0 h-[400px] w-[340px] max-[374px]:-left-8 max-[374px]:h-[340px] max-[374px]:w-[280px] sm:-left-2 sm:h-[460px] sm:w-[400px] md:-bottom-10 md:-left-4 md:h-[440px] md:w-[440px]">
            <Image
              src="/about-the-form/JazaBela no bg trimmed.png"
              alt="Jaza Sarmiento and Bela Capistrano, founders of JAZA Media"
              fill
              sizes="(min-width: 768px) 440px, (min-width: 640px) 400px, (min-width: 375px) 340px, 280px"
              className="object-contain object-bottom"
              priority
            />
          </div>
          <div className="relative z-10 flex flex-col items-end pt-6 pb-10 text-right md:pt-6 md:pb-12 md:pr-40">
            <h2 className="font-heading font-black uppercase leading-[0.95] text-brand-black">
              <span className="block text-3xl max-[374px]:text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
                Want us to help you
              </span>
              <span className="mt-2 block text-4xl max-[374px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                Explode Profit?
              </span>
            </h2>
            <p className="mt-4 text-base text-brand-black max-[374px]:text-sm md:text-lg">
              See how JAZA Media can help
            </p>
            <Link
              href="#"
              className="mt-3 inline-flex items-center rounded-full bg-brand-yellow px-8 py-3 text-sm font-black uppercase tracking-wide text-brand-black transition-transform hover:scale-105 max-[374px]:px-6 max-[374px]:py-2.5 max-[374px]:text-xs md:mt-6 md:text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
