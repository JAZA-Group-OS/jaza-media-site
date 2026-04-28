import Image from "next/image";
import Link from "next/link";

export function ExplodeProfitCta() {
  return (
    <section className="bg-white pt-12 md:pt-0">
      <div className="mx-auto grid max-w-6xl items-start gap-6 px-4 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[480/431] w-full md:max-h-[500px]">
          <Image
            src="/about-the-form/jaza-bela.png"
            alt="Jaza and Bela"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain object-bottom"
          />
        </div>
        <div className="pb-10 text-center md:pt-10 md:pb-16 md:text-left">
          <h2 className="font-heading text-4xl font-black uppercase leading-[1.05] text-brand-black md:text-5xl">
            Want us to help you
            <br />
            Explode Profit?
          </h2>
          <p className="mt-4 text-base text-brand-black md:text-lg">
            See how JAZA Media can help
          </p>
          <Link
            href="#"
            className="mt-6 inline-flex items-center rounded-full bg-brand-yellow px-8 py-3 text-sm font-black uppercase tracking-wide text-brand-black transition-transform hover:scale-105 md:text-base"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
