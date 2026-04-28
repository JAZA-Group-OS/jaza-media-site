import Link from "next/link";

export function ExplodeProfitCta() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-heading font-black uppercase leading-[1.05] text-brand-black">
          <span className="block whitespace-nowrap text-2xl md:text-3xl">
            Want us to help you
          </span>
          <span className="mt-1 block text-5xl md:text-6xl">
            Explode Profit?
          </span>
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
    </section>
  );
}
