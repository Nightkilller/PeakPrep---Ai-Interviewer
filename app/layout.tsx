import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeakPrep - Your AI Interview Copilot",
  description: "Intelligent Review and Interview System - Practice mock interviews with AI-powered voice interviewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${monaSans.className} antialiased`}>
        <ClerkProvider>
          <ThemeProvider>
            <main>
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
