import type { Metadata } from "next";
import { GFS_Didot, Poppins, Inter, Instrument_Serif } from "next/font/google";
import { getSiteBaseUrl } from "@/lib/site-url";
import "./globals.css";
import { SiteScrollDots } from "@/components/site-scroll-dots";

const gfsDidot = GFS_Didot({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_NAME = "JAZA Media";
const DEFAULT_TITLE = "JAZA Media — Scale Your Business";
const DEFAULT_DESCRIPTION =
  "Learn from the team that has scaled a portfolio to over ₱150m+ in annual revenue. Free marketing, lead generation, and business scaling resources from JAZA Media.";

export const metadata: Metadata = {
  // Resolves relative OG/canonical URLs against the deployment's real origin
  // (SITE_URL / Vercel envs / localhost). Without this, social-share and
  // canonical URLs would be malformed.
  metadataBase: new URL(getSiteBaseUrl()),
  // NOTE: individual pages set their own full titles (e.g. "About Us — JAZA
  // Media"), so no title template is applied here to avoid double suffixes.
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${gfsDidot.variable} ${poppins.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body
        className="min-h-screen bg-white text-brand-black font-sans"
        suppressHydrationWarning
      >
        {children}
        <SiteScrollDots />
      </body>
    </html>
  );
}
