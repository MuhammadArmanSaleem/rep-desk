import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Form & Iron — Training with intent",
  description: "A fictional gym website and RepDesk management demo.",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
