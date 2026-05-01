"use client";

import Image from "next/image";

import { useInView } from "@/lib/use-in-view";

type Testimonial = {
  name: string;
  role: string;
  photo: string;
  body?: string[];
  bg: "yellow" | "white" | "gray";
  span: 1 | 2 | 3;
  align?: "top" | "bottom";
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Francie G.",
    role: "from UI/UX Intern to Creative Agency Owner",
    photo: "/images/Francie%20Galapate.png",
    bg: "yellow",
    span: 1,
    align: "bottom",
  },
  {
    name: "Samantha M.",
    role: "from PR Assistant to Full-time Paid Content Creator",
    photo: "/images/Samantha%20Manuel.png",
    body: [
      "Since day one, ang dami nang opportunities and blessings na binigay sa akin, and I'm truly, truly grateful for all of it.",
      "Sobrang na-appreciate ko rin how you always go the extra mile for us. Super spoiled kami sa inyo, even though hybrid setup tayo, you still make sure we feel appreciated through gifts like clothes and so much more. It really shows how much you care beyond just work.",
      "Honestly, this was never just a job. Ms. Bela and Sir Jaza made us feel like we're part of a real family while also pushing us to grow and achieve our individual goals in life. JAZA Media became a big part of my journey, especially in helping me figure out what I truly want for my career.",
    ],
    bg: "white",
    span: 2,
  },
  {
    name: "Ron D.",
    role: "from Video Editor to Creative Agency Owner",
    photo: "/images/Ron%20David.png",
    bg: "gray",
    span: 1,
    align: "bottom",
  },
  {
    name: "James N.",
    role: "from Video Editor Intern to having own International Clients",
    photo: "/images/James%20Nunez.png",
    body: [
      "During my journey with JAZA Media, I learned how to edit faster and more efficiently while still keeping good quality. I also improved my basic editing skills and learned how to adjust my editing style for different niches or types of content.",
      "One of my biggest takeaways was time management and discipline. Because of the editing calendar and deadlines, I learned how to stay organized, manage my time better, and make sure all deliverables were complete and submitted on time.",
    ],
    bg: "yellow",
    span: 2,
  },
  {
    name: "Allyson A.",
    role: "from Virtual Assistant Intern to CNM Marketing Director",
    photo: "/images/Allyson%20Abad.png",
    body: [
      "You're truly one of the biggest inspirations for me and my partner, and I just want to say how grateful I am for everything you've shared with us. Being an intern under your supervision was such a meaningful and unforgettable experience. You didn't just teach skills—you really helped shape how I think, work, and grow in this field.",
      "I'm so thankful for the opportunity to be part of JAZA Media. The lessons, guidance, and real experiences I gained during my time there are things I still carry with me and apply in my career up to now. It honestly made a huge impact on who I am professionally today.",
      "I'll always appreciate the support, patience, and trust you gave me. Hoping to see you again soon! More power to JAZA Media and everything you continue to build and inspire. Thank you so much for everything. Luv you so much!",
    ],
    bg: "gray",
    span: 3,
  },
];

const BG_CLASSES: Record<Testimonial["bg"], string> = {
  yellow: "bg-brand-yellow",
  white: "bg-white",
  gray: "bg-neutral-200",
};

const SPAN_CLASSES: Record<Testimonial["span"], string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
};

function TestimonialCard({ t, delay }: { t: Testimonial; delay: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const pushNameDown = !!t.body || (t.align ?? "bottom") === "bottom";

  return (
    <div
      ref={ref}
      style={{ animationDelay: inView ? `${delay}ms` : undefined }}
      className={`flex flex-col rounded-[28px] p-6 md:p-7 ${BG_CLASSES[t.bg]} ${SPAN_CLASSES[t.span]} ${
        inView ? "animate-about-fade-up" : "opacity-0"
      }`}
    >
      {t.body && (
        <div className="space-y-3 font-heading text-[15px] leading-relaxed text-brand-black/90">
          {t.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      <div
        className={`flex items-center gap-3 ${
          pushNameDown ? "mt-auto pt-6" : ""
        }`}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full md:h-14 md:w-14">
          <Image
            src={t.photo}
            alt={t.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="font-heading text-brand-black">
          <div className="text-base font-bold md:text-lg">{t.name}</div>
          <div className="text-sm leading-snug text-brand-black/80">
            {t.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CareersTestimonials() {
  const { ref: headRef, inView: headIn } = useInView<HTMLDivElement>();
  const { ref: ctaRef, inView: ctaIn } = useInView<HTMLDivElement>();

  return (
    <section className="bg-neutral-100 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2
          ref={headRef}
          className={`text-center font-heading text-[28px] font-black leading-[1.15] tracking-tight text-brand-black md:text-[40px] lg:text-[48px] ${
            headIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          Why I Love Working at JAZA Media:
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={i * 80} />
          ))}
        </div>

        <div
          ref={ctaRef}
          className={`mt-10 text-center ${
            ctaIn ? "animate-about-fade-up" : "opacity-0"
          }`}
        >
          <a
            href="#openings"
            className="inline-block rounded-full bg-brand-yellow px-6 py-3 font-heading text-base font-bold text-brand-black shadow-sm transition-colors hover:bg-yellow-400 md:text-lg"
          >
            View Job Openings
          </a>
        </div>
      </div>
    </section>
  );
}
