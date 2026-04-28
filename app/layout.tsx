import type { Metadata } from "next";
import { GFS_Didot, Poppins, Inter, Montserrat } from "next/font/google";
import "./globals.css";

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

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JAZA Media — Scale Your Business",
  description:
    "Learn from the team that has scaled a portfolio to over ₱150m+ in annual revenue. Free marketing, lead generation, and business scaling resources from JAZA Media.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${gfsDidot.variable} ${poppins.variable} ${inter.variable} ${montserrat.variable} antialiased`}
    >
      <body className="min-h-screen bg-white text-brand-black font-sans">
        {children}
      </body>
    </html>
  );
}
