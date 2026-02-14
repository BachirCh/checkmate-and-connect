import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Checkmate & Connect',
    default: 'Checkmate & Connect - Chess & Entrepreneurship Community',
  },
  description: 'Community in Casablanca, Morocco connecting chess enthusiasts and entrepreneurs',
  openGraph: {
    title: 'Checkmate & Connect - Chess & Entrepreneurship Community',
    description: 'Community in Casablanca, Morocco connecting chess enthusiasts and entrepreneurs',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
