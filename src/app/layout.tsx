import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "CorpE - Admin Portal",
  description:
    "CorpE admin portal for managing company incorporation, clients, documents, and MCA filings in India.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextTopLoader color="var(--primary-500)" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
