import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | JAZA Media",
  description: "JAZA Media Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="dark bg-black text-white min-h-screen">{children}</div>;
}
