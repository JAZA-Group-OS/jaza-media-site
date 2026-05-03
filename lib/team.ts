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
    slug: "cfo",
    name: null,
    role: "MANAGING DIRECTOR, CHIEF FINANCIAL OFFICER",
    image: null,
  },
  {
    slug: "cso",
    name: null,
    role: "MANAGING DIRECTOR, CHIEF SALES OFFICER",
    image: null,
  },
  {
    slug: "cmo",
    name: null,
    role: "MANAGING DIRECTOR, CHIEF MARKETING OFFICER",
    image: null,
  },
  {
    slug: "cto",
    name: null,
    role: "MANAGING DIRECTOR, CHIEF TECHNOLOGY OFFICER",
    image: null,
  },
  {
    slug: "crisia",
    name: "CRISIA MANZANILLA",
    role: "SALES MANAGER",
    image: "/about-the-form/Crisia-Manzanilla.png",
    bioImage: "/about-the-firm/Crisia-Manzanilla-removebg-preview.png",
    bio: [
      "Crisia Manzanilla is a Filipino Sales Manager specializing in revenue generation, client relations, and digital sales solutions. She brings a strong foundation in sales strategy, partner management, and customer communication, helping businesses convert opportunities into measurable growth.",
      "With hands-on experience managing end-to-end sales campaigns, Crisia plays a key role in building and maintaining relationships with clients and partners while supporting brands in expanding their online presence through strategic outreach and performance-driven marketing initiatives.",
      "Before stepping into leadership in sales, she built her professional foundation in the BPO industry as a Collection Specialist, where she developed advanced skills in negotiation, communication, and customer relationship management. This experience shaped her results-oriented and client-first approach, allowing her to handle complex client situations while maintaining long-term trust and retention.",
      "Today, Crisia focuses on helping businesses strengthen their sales systems, improve campaign execution, and adopt digital solutions that increase efficiency, enhance customer experience, and drive sustainable revenue growth.",
      "Her mission is clear: turn conversations into conversions, build lasting client relationships, and help businesses scale through disciplined sales execution.",
    ],
  },
  {
    slug: "jallah",
    name: "JALLAH PAYNO",
    role: "ACCOUNT MANAGER",
    image: "/about-the-form/Jallah-Payno.png",
    bioImage: "/about-the-firm/Jallah-Payno-removebg-preview.png",
  },
  {
    slug: "cristal",
    name: "CRISTAL TAUP",
    role: "MARKETING MANAGER",
    image: "/about-the-form/Cristal-Taup.png",
    bioImage: "/about-the-firm/Cristal-Taup-removebg-preview.png",
  },
  {
    slug: "jm",
    name: "JM SARMIENTO",
    role: "PAY-PER-CLICK MANAGER",
    image: "/about-the-form/Jm-Sarniento.png",
    bioImage: "/about-the-firm/Jm-Sarniento-removebg-preview.png",
  },
  {
    slug: "franco",
    name: "FRANCO VILLAMOR",
    role: "TECH CONSULTANT",
    image: "/about-the-form/Franco-Villamor.png",
    bioImage: "/about-the-firm/Franco-Villamor-removebg-preview.png",
  },
  {
    slug: "omhar",
    name: "OMHAR REGIDOR",
    role: "TECH MANAGER",
    image: "/about-the-form/Omhar-Regidor.png",
    bioImage: "/about-the-firm/Omhar-Regidor-removebg-preview.png",
    bio: [
      "Omhar Regidor is a Filipino software developer, systems architect, and technology builder with over five years of experience in web and mobile application development. Combining technical precision with practical problem-solving, he specializes in transforming complex business challenges into clean, scalable digital solutions. His core belief is simple: great technology should solve real-world problems.",
      "His journey into the startup ecosystem began in December 2024 when entrepreneur and business builder Jaza Sarmiento invited him to become the first technical leader of Noxa Loyalty, a digital loyalty platform under the JAZA Group of Companies. Built to help businesses strengthen customer retention, Noxa Loyalty delivers an integrated Points and Stamp Card system designed to simplify how companies reward, engage, and retain their customers.",
      "As the founding technical builder of Noxa Loyalty, Omhar leads the platform's entire technical development — from system architecture and infrastructure planning to hands-on coding and product execution. In the early stage of the company, he carries multiple roles, laying the technological foundation that will scale into a full engineering organization.",
      "More than building applications, Omhar focuses on creating technology that removes friction for entrepreneurs. His mission is to design systems that are reliable, intuitive, and operationally efficient — empowering business owners with tools that work seamlessly so they can focus on growth instead of complexity.",
      "Now serving as Tech Manager, Omhar stands at the forefront of JAZA Group's expansion into the technology sector, representing the bridge between vision and execution — and proving that one committed technologist can become the catalyst for building scalable innovation.",
    ],
  },
  {
    slug: "sofhia",
    name: "SOFHIA CABALLERO",
    role: "KOL MANAGER",
    image: "/about-the-form/Sofhia-Caballero.png",
    bioImage: "/about-the-firm/Sofhia-Caballero-removebg-preview.png",
  },
  {
    slug: "executive-assistant",
    name: null,
    role: "EXECUTIVE ASSISTANT",
    image: null,
  },
];

export function getMember(slug: string): Member | undefined {
  return TEAM.find((m) => m.slug === slug);
}

export function getAllSlugs(): string[] {
  return TEAM.map((m) => m.slug);
}
