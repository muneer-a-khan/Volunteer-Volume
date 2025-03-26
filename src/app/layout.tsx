import type { Metadata } from "next";
import { Inter, Acme } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import RootLayout from "@/components/layout/RootLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const acme = Acme({
  weight: '400',
  subsets: ["latin"],
  variable: "--font-acme",
});

export const metadata: Metadata = {
  title: "Volunteer Volume - Virginia Discovery Museum",
  description: "Volunteer management system for the Virginia Discovery Museum",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${acme.variable} font-sans antialiased`}>
        <Providers>
          <RootLayout>
            {children}
          </RootLayout>
        </Providers>
      </body>
    </html>
  );
}