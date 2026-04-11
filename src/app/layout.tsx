import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coloured Harmony — Composition Engine",
  description: "Visual music theory and composition tool with harmonic maps, voice leading, and reharmonization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ 
        background: "#080810", 
        color: "#eeebe4", 
        fontFamily: "Georgia, serif", 
        margin: 0, 
        padding: 0,
        overflowX: "hidden"
      }}>
        {children}
      </body>
    </html>
  );
}
