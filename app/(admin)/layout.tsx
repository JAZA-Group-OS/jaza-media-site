import type React from "react";
import type { Metadata } from "next";

import { AdminTheme } from "@/components/admin/admin-theme";

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
  return <AdminTheme>{children}</AdminTheme>;
}
