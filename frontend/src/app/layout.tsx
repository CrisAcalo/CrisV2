import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../presentation/styles/globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acalo Portfolio",
  description: "Senior Software Engineer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is needed by next-themes to avoid mismatches on first render
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-center" richColors theme="system" />
      </body>
    </html>
  );
}
