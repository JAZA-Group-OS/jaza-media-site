"use client";

import Image from "next/image";

import { useInView } from "@/lib/use-in-view";

type Article = {
  src: string;
  alt: string;
  date: string;
  title: string;
  body: string;
};

const ARTICLES: Article[] = [
  {
    src: "/images/blog-1.png",
    alt: "JAZA Media team celebrating Yaki-Yaki's 2nd anniversary",
    date: "April 18",
    title: "Celebrated their 2nd anniversary with a touch of Japan vibes.",
    body: "One of the Yaki-Yaki branches recently celebrated its 2nd Anniversary, proudly hosted by JAZA Media. The event was filled with excitement through activities like the Tako Titan Eating Challenge, Trivia Day, and a Grand Raffle that energized the entire celebration. Guests enjoyed live appearances from four talented cosplayers, while our content creators produced dynamic campaign content throughout the event. Most importantly, our valued customers shared unforgettable moments and made the celebration truly special.",
  },
  {
    src: "/images/blog-2.png",
    alt: "May De Vera of SweetBlooms Flower Pastillas",
    date: "March 25",
    title:
      "A mompreneur of nearly 18 years shares her real journey through a national TV interview.",
    body: "May De Vera, the woman behind SweetBlooms Flower Pastillas, has spent 18 years in the business industry — and now, she's finally sharing the real story behind her journey. In a recent feature, she opens up about the ups and downs of building a business, how she was able to stay resilient through the years, and how she continues to evolve by venturing into new opportunities this 2026. What started as a simple handcrafted gift she used to make for her husband eventually grew into a multi-million business.",
  },
  {
    src: "/images/blog-3.png",
    alt: "One Click Away e-commerce agency team",
    date: "March 10",
    title: "From an ordinary e-commerce agency to a system powered e-commerce agency.",
    body: "They have been scaling their business rapidly, becoming one of the top e-commerce players in the East. However, their growth accelerated even further when they integrated a system — particularly in their telesales process and internal company platform. By adopting a more system-driven approach, they are now able to adapt to trends faster, operate more efficiently, and reduce overall costs. This shift has allowed them to scale with greater consistency, speed, and sustainability in a highly competitive market.",
  },
];

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <article
      ref={ref}
      style={{ animationDelay: inView ? `${index * 100}ms` : undefined }}
      className={`flex flex-col rounded-md border border-neutral-200 bg-white p-3 shadow-sm md:p-4 ${
        inView ? "animate-about-fade-up" : "opacity-0"
      }`}
    >
      <div className="overflow-hidden rounded-sm">
        <Image
          src={article.src}
          alt={article.alt}
          width={1200}
          height={750}
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 33vw, 100vw"
          className="aspect-[16/10] h-auto w-full object-cover"
          priority={index === 0}
        />
      </div>
      <p className="mt-4 font-heading text-sm text-brand-black/60">
        {article.date}
      </p>
      <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-brand-black md:text-xl">
        {article.title}
      </h3>
      <p className="mt-3 font-heading text-sm leading-relaxed text-brand-black/85 md:text-[15px]">
        {article.body}
      </p>
    </article>
  );
}

export function BlogArticles() {
  const { ref: headRef, inView: headIn } = useInView<HTMLHeadingElement>();

  return (
    <section className="bg-white pb-10 md:pb-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          ref={headRef}
          className={`font-heading text-2xl font-bold text-brand-black md:text-3xl ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          Our Latest Articles
        </h2>

        <div className="mt-6 grid gap-5 md:mt-8 md:grid-cols-3 md:gap-6">
          {ARTICLES.map((article, i) => (
            <ArticleCard key={article.title} article={article} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
