import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Inter } from "next/font/google";
import ReduxProvider from "@/redux/ReduxProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
        <div>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
