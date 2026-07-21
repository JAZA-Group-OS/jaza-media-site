import { CourseCard } from "./course-card";

export function FreeMarketingSection() {
  return (
    <section id="free-advance-marketing" className="bg-white py-[70px]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-black tracking-tight md:text-4xl lg:text-[36px]">
            <span className="text-brand-yellow">FREE</span>{" "}
            <span className="text-brand-black">ADVANCED MARKETING</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-neutral-700 md:text-lg">
            Videos, eBooks, Guides, Templates, Downloads &amp; more to help you succeed:
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-brand-black md:w-32" />
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-10">
          <CourseCard
            tag="IT'S FREE"
            title={
              <>
                MARKETING
                <br />
                COURSE
              </>
            }
            bookVariant="marketing"
            ctaLabel="Take this Course"
            ctaHref="/courses/rule-of-10x"
          />
          <CourseCard
            tag="NEW RELEASE"
            title={
              <>
                LEAD GENERATION
                <br />
                COURSE
              </>
            }
            bookVariant="advertising"
            ctaLabel="Take this Course"
            ctaHref="/courses/rule-of-10x"
          />
          <CourseCard
            tag="ONLINE/ONSITE"
            title={
              <>
                BUSINESS
                <br />
                SCALING
              </>
            }
            bookVariant="scaling"
            ctaLabel="Book a Call"
            ctaHref="/partner-with-us"
          />
        </div>
      </div>
    </section>
  );
}
