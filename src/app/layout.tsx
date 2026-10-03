import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { FooterSection } from "@/components/footer-section";
import { NavBar } from "@/components/nav-bar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Greenbloom — AI landscape redesign from a photo",
  description:
    "Upload a photo of your yard and get back an AI-redesigned landscape in five distinct styles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-900 to-black text-gray-100 min-h-screen flex flex-col`}
      >
        <NavBar />
        <div className="flex-1">{children}</div>
        <FooterSection />
      </body>
    </html>
  );
}
