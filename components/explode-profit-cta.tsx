import Link from "next/link";

export function ExplodeProfitCta() {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center">
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
    </section>
  );
}
