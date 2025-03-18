import type { Metadata } from "next";
import { Inter, Acme } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${acme.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}