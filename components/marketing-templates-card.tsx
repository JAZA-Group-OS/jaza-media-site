import Image from "next/image";

export function MarketingTemplatesCard() {
  return (
    <section className="bg-white pb-16 md:pb-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_4px_40px_rgba(0,0,0,0.08)] ring-1 ring-neutral-100">
          <span className="absolute top-4 right-4 z-10 inline-block rounded-md bg-tag-red px-3 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
            BRAND NEW
          </span>

          <div className="grid items-center gap-0 md:grid-cols-2">
            <div className="relative">
              <Image
                src="/about-the-form/Marketing Templates.png"
                alt="JAZA Media marketing templates preview"
                width={4000}
                height={2250}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="block h-auto w-full"
              />
            </div>

            <div className="p-8 md:p-10">
              <h3 className="font-heading text-xl leading-tight font-black text-brand-black md:text-2xl">
                JAZA MEDIA
                <br />
                MARKETING TEMPLATES
              </h3>
              <a
                href="#"
                className="mt-5 inline-flex items-center rounded-full bg-brand-yellow px-8 py-3 text-sm font-bold text-brand-black transition-transform hover:scale-[1.02]"
              >
                Download Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
