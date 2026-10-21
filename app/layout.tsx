import type { Metadata } from "next";
import "./globals.css";
import PageMotion from "@/components/page-motion";
export const metadata: Metadata = {
  title: "Form & Iron — Training with intent",
  description: "A fictional gym website and RepDesk management demo.",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PageMotion />
      </body>
    </html>
  );
}
