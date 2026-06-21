import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ClientFlow CRM",
  description:
    "A SaaS client portal and project management dashboard for agencies and freelancers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans")}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
