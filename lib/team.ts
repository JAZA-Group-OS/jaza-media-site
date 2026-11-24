export type Accent = "purple";

export type Member = {
  slug: string;
  name: string | null;
  role: string;
  image: string | null;
  bioImage?: string;
  accent?: Accent;
  bio?: string[];
  mirror?: boolean;
};

export const TEAM: Member[] = [
  {
    slug: "jaza",
    name: "JAZA SARMIENTO",
    role: "MANAGING PARTNER, CHAIRMAN & CEO",
    image: "/about-the-form/Jaza-Sarmiento.png",
    bioImage: "/about-the-firm/Jaza-Sarmiento-removebg-preview.png",
    bio: [
      "Jaza Sarmiento is a Filipino entrepreneur, investor, and business builder obsessed with growth, scale, and execution. He started in 2022 as a freelancer in digital marketing with one objective — build businesses that produce real revenue, real impact, and real freedom.",
      "What began as a one-man freelance operation quickly evolved into JAZA Media, a Philippine-registered company focused on customer acquisition and business scaling. In less than two years, Jaza transformed the company into a full-scale organization with its own headquarters, proving that speed, systems, and sales execution beat traditional business timelines.",
      "He didn't stop at marketing.",
      "Jaza expanded into e-commerce and tech company ultimately forming JAZA Group of Companies — a holding company designed to build, acquire, and scale asset-light, high cash-flow businesses without relying on outside investors.",
      "After mastering his growth process, he turned his execution framework into a licensing model that accelerated expansion across multiple ventures. Within a short period, he founded, scaled, and exited three companies, transitioning from freelancer to Managing Partner, Chairman and CEO by 2025.",
      "Known for his expertise in customer acquisition and monetization, Jaza believes every business problem is a sales problem — and every opportunity is solved through systems, attention, and execution.",
      "Through JAZA Foundation, he also invests his time and resources into entrepreneurship education and community outreach, helping create opportunities for individuals who lack access but possess ambition.",
      "Jaza's mission is simple: build companies, create elite leaders, and multiply impact through scalable businesses.",
    ],
  },
  {
    slug: "bela",
    name: "BELA CAPISTRANO",
    role: "MANAGING PARTNER, CHIEF OPERATING OFFICER",
    image: "/about-the-form/Bela-Capistrano.png",
    bioImage: "/about-the-firm/Bela-Capistrano-removebg-preview.png",
    bio: [
      "Bela Capistrano is a Filipino entrepreneur, enterprise operations strategist, and execution leader built for speed, structure, and scale. She started in 2023 as a 9–5 marketing employee in a leading cosmetic brand in the Philippines, where she quickly rose as a top performer through relentless execution and operational discipline.",
      "Everything changed in 2024 when she met Jaza Sarmiento. From that point forward, she stepped into high-level business turnarounds alongside him — not as support, but as an operator in the field. Together, they executed business restructures, revenue recoveries, and rapid-scale systems that would later define the foundation of JAZA Group of Companies.",
      "Bela evolved from a corporate performer into a full-scale execution architect. She built and refined an operations framework designed for speed, consistency, and scale — later systemized into a licensing model that powered expansion across multiple ventures. Within a short span, she co-founded, scaled, and exited three companies, transitioning from employee to Managing Partner and Chief Operations Officer by 2025.",
      "Today, she runs the operational backbone of the entire JAZA Group of Companies, overseeing execution across JAZA Media (performance advertising agency), Noxa Tech (business systems, apps, and automation), and multiple e-commerce and digital commerce operations across web, Facebook, and TikTok.",
      "Alongside Jaza, she forms the operational half of a high-performance business partnership — where Jaza drives vision, acquisition, and scaling strategy, while Bela drives execution, systems, and delivery. Together, they function as a unified force: one builds the machine, the other makes it run at scale.",
      "Through JAZA Foundation, Bela also leads structured community outreach programs, focusing on education access and opportunity distribution. She operates with a core principle of disciplined abundance — give, execute, scale, repeat.",
      "Bela's mission is direct and uncompromising: build operational systems that don't break under pressure, develop elite execution teams, and scale businesses through precision, speed, and discipline — alongside Jaza in building a legacy-driven enterprise ecosystem.",
    ],
  },
  {
    slug: "manny",
    name: "MANNY GARCES",
    role: "MANAGING PARTNER, COMPANY ADVISOR",
    image: "/about-the-form/Manny-Garces.png",
    bioImage: "/about-the-firm/Manny-Garces-removebg-preview.png",
    bio: [
      "Manny Garces is a Filipino businessman, investor, and strategic advisor known for developing leaders, building industries, and creating long-term business value. As an established entrepreneur, he owns and operates multiple ventures, including a resort and internationally licensed scuba diving and freediving business located in Bauan, Batangas.",
      "More than an investor, Manny became the first believer in the vision of Jaza Sarmiento — recognizing early the potential behind Jaza and Bela's ambition to build scalable companies. From the beginning, he provided not only financial support but, more importantly, strategic guidance, mentorship, and leadership perspective during critical business decisions and growth stages.",
      "He played a pivotal role in encouraging the founders to formally register and structure their businesses in the Philippines, emphasizing transparency, credibility, and responsible entrepreneurship through proper governance and tax compliance. This foundational decision helped transform JAZA Media from a fast-growing operation into a legitimate and scalable corporate organization.",
      "As JAZA Media gained rapid traction and industry recognition, Manny officially stepped into the role of Managing Partner and Company Advisor in 2025, helping guide expansion beyond marketing into technology development, e-commerce, and diversified business ventures under the JAZA Group ecosystem.",
      "Within JAZA Foundation, Manny actively contributes financial resources, mentorship, and personal time alongside his family, supporting quarterly community outreach programs focused on empowering individuals with ambition but limited access to opportunity — often opening doors within his own businesses to help others grow.",
      "Manny's philosophy is clear and enduring: invest in people before investing in businesses. His mission is to guide the next generation of entrepreneurs, build enterprises that create real impact, and help shape a better future through leadership, mentorship, and responsible wealth creation.",
    ],
  },
  {
    slug: "abie",
    name: "ABIE CANAVERAL",
    role: "CHIEF MARKETING OFFICER",
    image: null,
  },
  {
    slug: "bea",
    name: "BEA SICAT",
    role: "PROJECT HEAD",
    image: null,
  },
  {
    slug: "aeron",
    name: "AERON TESORO",
    role: "MULTIMEDIA HEAD",
    image: null,
  },
  {
    slug: "jyrille",
    name: "JYRILLE CARAIG",
    role: "KOL HEAD",
    image: null,
  },
];

export function getMember(slug: string): Member | undefined {
  return TEAM.find((m) => m.slug === slug);
}

export function getAllSlugs(): string[] {
  // Only members with a written bio get a /team/[slug] page.
  return TEAM.filter((m) => m.bio?.length).map((m) => m.slug);
}
