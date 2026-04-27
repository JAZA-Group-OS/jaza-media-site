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
    role: "MANAGING PARTNER, FOUNDER & CEO",
    image: "/images/jaza-square.webp",
    bioImage: "/images/jaza.webp",
  },
  {
    slug: "bela",
    name: "BELA CAPISTRANO",
    role: "MANAGING PARTNER, CHIEF OPERATING OFFICER",
    image: "/images/bela-square.webp",
    bioImage: "/images/bela.webp",
    mirror: true,
  },
  {
    slug: "manny",
    name: "MANNY GARCES",
    role: "MANAGING PARTNER, COMPANY ADVISOR",
    image: "/images/manny-square.webp",
    bioImage: "/images/manny.webp",
  },
  {
    slug: "cfo",
    name: null,
    role: "MANAGING DIRECTOR, CHIEF FINANCIAL OFFICER",
    image: null,
  },
  {
    slug: "nica",
    name: "NICA SUMALBAG",
    role: "MANAGING DIRECTOR, CHIEF MARKETING OFFICER",
    image: "/images/nica-square.webp",
    bioImage: "/images/nica.webp",
  },
  {
    slug: "omhar",
    name: "OMHAR REGIDOR",
    role: "MANAGING DIRECTOR, CHIEF TECHNOLOGY OFFICER",
    image: "/images/omhar-square.webp",
    bioImage: "/images/omhar.webp",
  },
  {
    slug: "ppc-manager",
    name: null,
    role: "PAY-PER-CLICK MANAGER",
    image: null,
  },
  {
    slug: "jm",
    name: "JM SARMIENTO",
    role: "CREATIVE MANAGER",
    image: "/images/jm-square.webp",
    bioImage: "/images/jm.webp",
  },
  {
    slug: "charles",
    name: "CHARLES ROSARIO",
    role: "MEDIA MANAGER",
    image: null,
  },
  {
    slug: "cristal",
    name: "CRISTAL TAUP",
    role: "KOL MANAGER",
    image: "/images/cristal-square.webp",
    bioImage: "/images/cristal.webp",
  },
  {
    slug: "uiux-manager",
    name: null,
    role: "UI/UX MANAGER",
    image: null,
    accent: "purple",
  },
  {
    slug: "lead-ea",
    name: null,
    role: "LEAD EXECUTIVE ASSISTANT",
    image: null,
  },
];

export function getMember(slug: string): Member | undefined {
  return TEAM.find((m) => m.slug === slug);
}

export function getAllSlugs(): string[] {
  return TEAM.map((m) => m.slug);
}