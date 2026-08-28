import type { Metadata } from 'next';
import { Outfit, Figtree } from 'next/font/google';
import { site } from '@/lib/site';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || site.url),
  title: {
    template: `%s | ${site.name}`,
    default: `${site.name} — Casablanca's weekly startup community`,
  },
  description: site.description,
  keywords: [
    'Casablanca startup community',
    'Morocco startups',
    'founders Casablanca',
    'networking Casablanca',
    'startup meetup Morocco',
    'Commons Zerktouni',
    'Checkmate & Connect',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${site.name} — Casablanca's weekly startup community`,
    description: site.description,
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    url: site.url,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — Casablanca's weekly startup community`,
    description: site.description,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${figtree.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-canvas text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
