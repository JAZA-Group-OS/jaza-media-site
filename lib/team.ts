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
    bio: [
      "Jallah Payno is a Filipino Account Manager specializing in brand partnerships, client relationship management, and creator-driven marketing campaigns. Known for her strong organizational leadership and communication skills, she plays a critical role in connecting brands, creators, and marketing teams to deliver aligned, high-performing campaigns.",
      "As an Account Manager, Jallah serves as the strategic bridge between businesses and creators — ensuring seamless communication, clear campaign execution, and long-term partnership success. She oversees the full marketing workflow, from recruitment and onboarding of affiliates and influencers to campaign coordination, relationship management, and performance tracking.",
      "With hands-on experience in digital marketing operations, she manages both internal and external campaign processes, working closely with affiliates, influencers, and content creators to align brand objectives with audience engagement strategies that drive visibility, conversions, and sustained growth.",
      "Her expertise includes client servicing, campaign management, affiliate ecosystem development, and sales performance monitoring. Jallah's ability to manage multiple accounts while maintaining strong partner relationships enables brands to scale efficiently through structured, creator-powered marketing systems.",
      "Driven by strategy, collaboration, and measurable results, Jallah is committed to helping brands strengthen their affiliate networks, enhance creator engagement, and achieve consistent business growth through disciplined account management and performance-focused execution.",
    ],
  },
  {
    slug: "cristal",
    name: "CRISTAL TAUP",
    role: "MARKETING MANAGER",
    image: "/about-the-form/Cristal-Taup.png",
    bioImage: "/about-the-firm/Cristal-Taup-removebg-preview.png",
    bio: [
      "Cristal Taup is a Filipino content creator, brand ambassador, and marketing personality known for combining creativity, communication, and audience connection. Currently a dedicated nursing student, she balances her academic journey with active involvement in the marketing and digital content industry, where she represents brands through storytelling, visual content, and live audience engagement.",
      "Through freelance modeling, brand collaborations, and content creation, Cristal has developed strong on-camera presence and professional brand representation skills. She specializes in producing both static and motion content, participating in creative marketing campaigns, and hosting live selling sessions where she showcases products, interacts with customers in real time, and drives sales through persuasive and authentic communication.",
      "Her experience as a brand ambassador includes promoting businesses through digital campaigns, events, and online platforms, helping brands strengthen visibility and build deeper connections with their target audience. With nearly four years of experience in cosplay, Cristal brings a unique creative advantage — transforming themed concepts into engaging promotional experiences that capture attention and elevate brand storytelling.",
      "Driven by passion and authenticity, Cristal approaches every project with energy, adaptability, and professionalism. She is committed to helping brands enhance their presence, communicate their message effectively, and create meaningful engagement with their communities.",
    ],
  },
  {
    slug: "jm",
    name: "JM SARMIENTO",
    role: "PAY-PER-CLICK MANAGER",
    image: "/about-the-form/Jm-Sarniento.png",
    bioImage: "/about-the-firm/Jm-Sarniento-removebg-preview.png",
    bio: [
      "JM Sarmiento is a Filipino Advertising Specialist focused on performance marketing, direct-response strategy, and scalable customer acquisition systems. His work is driven by one core principle: turning attention into measurable revenue.",
      "He began his professional journey with JAZA Media in 2025, initially operating on the creative side of marketing, where he developed strong expertise in content creation, scriptwriting, and video production. While working closely with brands, he identified a common industry problem — businesses were producing visually strong content that generated engagement but failed to produce consistent sales results.",
      "Recognizing this gap, JM transitioned into paid advertising and performance marketing, specializing in pay-per-click (PPC) and conversion-focused campaign strategy. By combining storytelling psychology with data-driven execution, he developed a creative-first advertising methodology, where messaging, positioning, and audience behavior are optimized to drive conversions rather than vanity metrics.",
      "His approach centers on delivering the right message to the right audience at the right moment. Through continuous testing, optimization, and strategic scaling, JM builds structured advertising systems designed to transform interest into action and campaigns into predictable revenue engines.",
      "Throughout his career, he has helped small and growing brands achieve consistent six-figure revenue performance through paid advertising across multiple industries. Known for turning underperforming campaigns into scalable acquisition systems, his work emphasizes strong hooks, persuasive narratives, conversion-focused creatives, and disciplined performance tracking aligned with business objectives.",
      "Beyond campaign execution, JM also mentors marketers, creators, and business owners in bridging the gap between creativity and conversion. His mentorship focuses on practical execution, strategic thinking, and developing advertising content that performs — not just attracts attention.",
      "Today, JM collaborates with brands serious about growth, helping them leverage paid media as a reliable and scalable revenue channel. His core expertise includes direct-response advertising, scriptwriting, storytelling, social media ads, video editing, and campaign optimization.",
      "JM believes successful advertising is not defined by aesthetics alone, but by outcomes — because if it doesn't convert, it doesn't work.",
    ],
  },
  {
    slug: "franco",
    name: "FRANCO VILLAMOR",
    role: "TECH CONSULTANT",
    image: "/about-the-form/Franco-Villamor.png",
    bioImage: "/about-the-firm/Franco-Villamor-removebg-preview.png",
    bio: [
      "Franco Villamor is a Filipino AI Engineer and Tech Consultant with over six years of programming experience and deep specialization in artificial intelligence systems development. Known for his technical precision and innovation mindset, he operates at the intersection of advanced technology and practical business execution — building AI solutions designed to solve real operational problems.",
      "His journey with the JAZA Group of Companies began in January 2024 when entrepreneur Jaza Sarmiento brought him in as Tech Consultant for Noxa Loyalty, recognizing his ability to think beyond traditional development and engineer technology capable of creating true competitive advantage for businesses.",
      "Within Noxa Loyalty, Franco played a pivotal role in expanding the platform's technological capabilities by designing and developing the AI Caller, one of the company's flagship innovations. The system automates critical customer communication processes including appointment reminders, follow-ups, and outbound engagement — allowing businesses to significantly reduce manpower costs while maintaining consistent customer interaction and retention.",
      "His work reflects the broader vision behind Noxa: technology should simplify operations, increase efficiency, and empower business owners to scale without operational friction. By integrating artificial intelligence into everyday business workflows, Franco helps transform complex processes into intelligent, automated systems that operate reliably at scale.",
      "As Tech Consultant, Franco bridges the gap between cutting-edge AI innovation and real-world business application. He serves as a key technological architect supporting Noxa Loyalty's evolution into a full-scale technology company and strengthening the JAZA Group's expansion into AI-driven solutions.",
      "Franco's mission is clear: build intelligent systems that make businesses faster, leaner, and future-ready.",
    ],
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
    bio: [
      "Sofhia Caballero is a Filipino KOL Manager, content creator, and brand partnership specialist known for combining creativity, communication, and strong industry connections to build high-impact marketing collaborations. Currently a dedicated nursing student, she balances her academic journey with an active role in the marketing and digital content industry, where she leads influencer and talent coordination for brand campaigns.",
      "As KOL (Key Opinion Leader) Manager, Sofhia oversees the sourcing and pooling of affiliates, content creators, influencers, TV hosts, and Filipino artists for brand activations and marketing initiatives. Leveraging her extensive network and industry relationships, she connects brands with the right personalities to maximize reach, credibility, and campaign performance.",
      "She manages the full influencer collaboration process — from talent identification and coordination to communication alignment, campaign preparation, and execution. Sofhia is also responsible for preparing and organizing PR packages, ensuring that every brand collaboration delivers a professional and memorable experience for creators and partners.",
      "With hands-on experience in freelance modeling, brand collaborations, and content creation, she brings strong on-camera understanding and creator insight, allowing her to bridge the gap between brands and talents effectively. Her background in live selling, creative campaigns, and brand ambassadorship enables her to design collaborations that are authentic, engaging, and conversion-driven.",
      "Driven by passion, organization, and relationship-building, Sofhia plays a key role in strengthening the creator ecosystem of JAZA Media — helping brands expand their influence, activate the right voices, and create campaigns that resonate with audiences at scale.",
      "Her mission is simple: build powerful creator networks, execute seamless brand collaborations, and turn influence into measurable business impact.",
    ],
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
