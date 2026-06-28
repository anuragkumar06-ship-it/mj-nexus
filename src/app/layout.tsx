import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MJ Nexus — The Operating System for Internship-Driven Teams",
  description:
    "MJ Nexus is a premium AI-powered platform that manages the complete candidate and intern lifecycle — recruitment, onboarding, performance, certification, and analytics — for MJ Marketing Consultancy.",
  keywords: [
    "MJ Nexus",
    "internship management",
    "AI recruitment",
    "talent intelligence",
    "MJ Marketing Consultancy",
  ],
  authors: [{ name: "MJ Marketing Consultancy" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-offwhite text-[#0b1220]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
