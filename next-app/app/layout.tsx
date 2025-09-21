import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHEESE WONDERLAND｜KU-DETA',
  description: 'とろけて・食べて・遊べるチーズテーマパーク。10/5(日) 17:30–20:00｜1ドリンク付 ¥3,000｜岐阜・KU-DETAで開催。ライブ演出多数。',
  metadataBase: new URL('https://kudeta-japan.github.io/cheeseparty/'),
  openGraph: {
    title: 'CHEESE WONDERLAND｜KU-DETA',
    description: '10/5(日) 17:30–20:00｜1ドリンク付 ¥3,000。とろけて・食べて・遊べるチーズテーマパーク！',
    url: 'https://kudeta-japan.github.io/cheeseparty/',
    type: 'website',
    images: [{ url: '/img/ogp.jpg' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHEESE WONDERLAND｜KU-DETA',
    description: '10/5(日) 17:30–20:00｜1ドリンク付 ¥3,000。とろけて・食べて・遊べるチーズテーマパーク！',
    images: ['/img/ogp.jpg']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
