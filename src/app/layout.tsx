import { Toaster } from "react-hot-toast";
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
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <NextTopLoader color="var(--primary-500)" />
        <ReduxProvider>{children}</ReduxProvider>
        <div>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
