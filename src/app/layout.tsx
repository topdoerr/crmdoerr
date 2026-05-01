import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TopDoerr",
  description: "Customer Relationship Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-serif antialiased">{children}</body>
    </html>
  );
}
