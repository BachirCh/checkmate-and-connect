import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://checkmateconnect.com'),
  title: {
    template: '%s | Checkmate & Connect',
    default: 'Checkmate & Connect - Chess & Entrepreneurship Community',
  },
  description: 'Join 200+ members every Wednesday at 6pm at Commons in Casablanca for chess and entrepreneurship meetups.',
  keywords: ['chess', 'entrepreneurship', 'Casablanca', 'community', 'networking', 'Morocco', 'Commons'],
  openGraph: {
    title: 'Checkmate & Connect - Chess & Entrepreneurship Community',
    description: 'Join 200+ members every Wednesday at 6pm at Commons in Casablanca for chess and entrepreneurship meetups.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Checkmate & Connect',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Checkmate & Connect',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checkmate & Connect - Chess & Entrepreneurship Community',
    description: 'Join 200+ members every Wednesday at 6pm at Commons in Casablanca for chess and entrepreneurship meetups.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
