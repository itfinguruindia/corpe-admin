import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Inter } from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";
import NextTopLoader from "nextjs-toploader";
import { getMetadataForPathname } from "@/lib/site-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";
  return getMetadataForPathname(pathname);
}

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
