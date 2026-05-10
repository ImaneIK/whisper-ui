import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "./providers";
import { AnonProvider } from "./providers/AnonProvider";

export const metadata: Metadata = {
  title: "Whisper — Workplace truth, spoken softly",
  description:
    "Anonymous reviews from former employees. Discover what it's really like to work at companies you care about.",

  openGraph: {
    title: "Whisper — Workplace truth, spoken softly",
    description: "Anonymous, moderated reviews from former employees.",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  
  return (
    <html lang="en">
      <body>
        <Providers>
        <AnonProvider>
        {children}
        </AnonProvider>
        </Providers>
      </body>
    </html>
  );
}