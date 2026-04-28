import { TeamCard } from "@/components/team-card";
import { TEAM } from "@/lib/team";

export function TeamGrid() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="pb-[30px] text-center font-heading text-4xl font-black tracking-tight md:text-5xl">
          MEET OUR LEADERSHIP TEAM
        </h1>
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:mt-16 md:gap-y-16 lg:grid-cols-3">
          {TEAM.map((member) => (
            <TeamCard key={member.slug} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
