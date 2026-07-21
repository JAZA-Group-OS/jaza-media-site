import Image from "next/image";

export function Founders() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center font-heading text-2xl font-black tracking-tight md:text-3xl">
          ABOUT OUR FOUNDERS
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.5fr] md:gap-12">
          <div className="relative aspect-square w-full overflow-hidden border-2 border-brand-black bg-neutral-200">
            <Image
              src="/about-the-form/bela-jaza.png"
              alt="Jaza Sarmiento and Bela Capistrano, founders of JAZA Media"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-4 text-base leading-relaxed text-brand-black md:text-lg">
            <p>
              Jaza and Bela are the co-founders and managing partners of JAZA Media.
              In just three years, they have grown the company&apos;s portfolio to over
              ₱150M in annual revenue.
            </p>
            <p>
              Jaza began his career as a freelance video editor and Facebook
              advertiser before building one of the Philippines&apos; most recognized
              business communities, now with over 66,000 business-owner members. He
              is also the author of two bestselling ebooks, Marketing Course and
              Advertising Course, with a combined total of 1,000+ copies sold.
            </p>
            <p>
              At JAZA Media, Jaza and Bela&apos;s mission is to help local and
              international businesses scale while making practical, real-world
              business education accessible to everyone. To achieve this, they are
              committed to building a company that positively impacts every person
              it works with, guided by a culture that prioritizes praise, growth,
              and empowerment over punishment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
