// next-app/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHEESE WONDERLAND",
  icons: { icon: "/favicon.png" },
  openGraph: {
    url: "https://kudeta-japan.github.io/cheeseparty/",
    images: ["img/ogp.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
