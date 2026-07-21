"use client";

import Image from "next/image";

import { useInView } from "@/lib/use-in-view";

export function BlogFeatured() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section className="bg-white pb-16 md:pb-20">
      <div className="mx-auto max-w-6xl px-4">
        <article
          ref={ref}
          className={`overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm ${
            inView ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <Image
              src="/images/blog-4.png"
              alt="Valentine's Creators Campaign featuring Kathryn Bernardo, Alden Richards, Yobab, Team Pataba, KaladKaren and TikTok affiliates"
              width={1800}
              height={563}
              sizes="(min-width: 1024px) 1100px, 100vw"
              className="aspect-[16/5] h-auto w-full object-cover sm:aspect-[16/4]"
            />
          </div>

          <div className="bg-neutral-100 px-5 py-6 md:px-8 md:py-8">
            <p className="font-heading text-sm text-brand-black/60">
              February 14
            </p>
            <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-brand-black md:text-xl lg:text-2xl">
              Hosted a Valentine&apos;s Creators Campaign featuring Filipino
              stars Kathryn Bernardo and Alden Richards, alongside well-known
              social media creators Yobab and Team Pataba, celebrated TV host
              KaladKaren, and top TikTok affiliates.
            </h3>
            <div className="mt-4 space-y-4 font-heading text-sm leading-relaxed text-brand-black/85 md:text-base">
              <p>
                Every time JAZA Media launches a major campaign for our
                clients, we collaborate with a diverse group of creators to
                produce engaging content and endorse their products across
                social media platforms. Depending on the scope and
                deliverables, we structure these partnerships through paid
                collaborations or x-deals to maximize reach and impact. This
                strategy is designed to strengthen SEO presence, position the
                brand as a top player in its industry, and drive consistent
                organic sales. By tapping into creators with established
                audiences, businesses gain credible &ldquo;faces&rdquo; that
                represent and promote their brand authentically.
              </p>
              <p>
                More importantly, the content created doesn&apos;t stop at
                organic reach — it becomes a powerful asset for advertising.
                Brands can amplify these photos and videos through paid ads,
                further increasing visibility and conversion potential. In
                today&apos;s e-commerce landscape, this approach is no longer
                optional — it&apos;s an investment. Leveraging creators,
                combined with strategic advertising, is how brands scale,
                build trust, and generate sustainable sales in 2026.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
