'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/events', label: 'Events' },
  { href: '/members', label: 'Members' },
  { href: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-sm border-b border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-lg font-bold text-white tracking-tight font-heading">
          Checkmate &amp; Connect
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-white'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/join"
            className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Join Us
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#333333] bg-black">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block text-sm font-medium ${
                  pathname === link.href
                    ? 'text-white'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/join"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Join Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
