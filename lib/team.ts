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
  },
  {
    slug: "bela",
    name: "BELA CAPISTRANO",
    role: "MANAGING PARTNER, CHIEF OPERATING OFFICER",
    image: "/about-the-form/Bela-Capistrano.png",
  },
  {
    slug: "manny",
    name: "MANNY GARCES",
    role: "MANAGING PARTNER, COMPANY ADVISOR",
    image: "/about-the-form/Manny-Garces.png",
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
    slug: "jallah",
    name: "JALLAH PAYNO",
    role: "MANAGING DIRECTOR, CHIEF MARKETING OFFICER",
    image: "/about-the-form/Jallah-Payno.png",
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
  },
  {
    slug: "account-manager",
    name: null,
    role: "ACCOUNT MANAGER",
    image: null,
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
  },
  {
    slug: "franco",
    name: "FRANCO VILLAMOR",
    role: "TECH CONSULTANT",
    image: "/about-the-form/Franco-Villamor.png",
  },
  {
    slug: "omhar",
    name: "OMHAR REGIDOR",
    role: "TECH MANAGER",
    image: "/about-the-form/Omhar-Regidor.png",
  },
  {
    slug: "cristal",
    name: "CRISTAL TAUP",
    role: "KOL MANAGER",
    image: "/about-the-form/Cristal-Taup.png",
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
