import type { Metadata } from 'next';
import { Sora, Sacramento } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
});

// Sacramento is used exclusively for the Alsama wordmark.
const sacramento = Sacramento({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sacramento',
});

export const metadata: Metadata = {
  title: 'Alsama Lesson Planner',
  description: 'Lesson planning portal for the Alsama Project English curriculum',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${sacramento.variable}`}>
      <body>{children}</body>
    </html>
  );
}
