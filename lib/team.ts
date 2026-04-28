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
  },
  {
    slug: "bela",
    name: "BELA CAPISTRANO",
    role: "MANAGING PARTNER, CHIEF OPERATING OFFICER",
    image: "/about-the-form/Bela-Capistrano.png",
    bioImage: "/about-the-firm/Bela-Capistrano-removebg-preview.png",
  },
  {
    slug: "manny",
    name: "MANNY GARCES",
    role: "MANAGING PARTNER, COMPANY ADVISOR",
    image: "/about-the-form/Manny-Garces.png",
    bioImage: "/about-the-firm/Manny-Garces-removebg-preview.png",
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
  },
  {
    slug: "jallah",
    name: "JALLAH PAYNO",
    role: "ACCOUNT MANAGER",
    image: "/about-the-form/Jallah-Payno.png",
    bioImage: "/about-the-firm/Jallah-Payno-removebg-preview.png",
  },
  {
    slug: "marketing-manager",
    name: null,
    role: "MARKETING MANAGER",
    image: null,
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
  },
  {
    slug: "cristal",
    name: "CRISTAL TAUP",
    role: "KOL MANAGER",
    image: "/about-the-form/Cristal-Taup.png",
    bioImage: "/about-the-firm/Cristal-Taup-removebg-preview.png",
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
