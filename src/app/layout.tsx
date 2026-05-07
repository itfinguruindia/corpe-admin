import { Toast } from "@heroui/react";
import "./globals.css";
import { Inter } from "next/font/google";
import ReduxProvider from "@/redux/ReduxProvider";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextTopLoader color="var(--primary-500)" />
        <ReduxProvider>{children}</ReduxProvider>
        <Toast.Provider placement="top end" />
      </body>
    </html>
  );
}
