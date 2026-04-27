import Image from "next/image";
import Link from "next/link";

export function ExplodeProfitCta() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-end gap-6 px-4 md:grid-cols-2 md:gap-8">
        <div className="flex items-end justify-center md:justify-start">
          <Image
            src="/images/jaza-footer.webp"
            alt="Jaza"
            width={400}
            height={600}
            className="h-auto w-[55%] max-w-[260px] object-contain"
            priority={false}
          />
          <Image
            src="/images/bela-footer.webp"
            alt="Bela"
            width={400}
            height={500}
            className="-ml-8 h-auto w-[55%] max-w-[260px] object-contain"
            priority={false}
          />
        </div>
        <div className="pb-8 md:pb-16">
          <h2 className="font-heading text-3xl font-black uppercase leading-[1.05] text-brand-black md:text-5xl">
            Want us to help you
            <br />
            Explode Profit?
          </h2>
          <p className="mt-4 text-base text-brand-black md:text-lg">
            See how JAZA Media can help
          </p>
          <Link
            href="#"
            className="mt-6 inline-flex items-center rounded-full bg-brand-yellow px-8 py-3 text-sm font-black uppercase tracking-wide text-brand-black transition-transform hover:scale-[1.02] md:text-base"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
