import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Montreal Metro & REM Status",
  description: "Combined live service status for the STM metro and the REM.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
