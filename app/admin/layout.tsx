'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setSidebarOpen(false);

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/members', label: 'Members' },
    { href: '/admin/events', label: 'Events' },
  ];

  // Hide sidebar on login page
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className="min-h-screen bg-black text-white">
      {!isLoginPage && (
        <>
          {/* Hamburger button - mobile only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed left-0 top-0 z-40 w-64 h-screen
              bg-gray-900 border-r border-gray-800
              transition-transform duration-300
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0
            `}
          >
            <div className="flex flex-col h-full p-4">
              {/* Logo/Title */}
              <div className="mb-8 pt-12 md:pt-4">
                <h1 className="text-2xl font-bold">C&C Admin</h1>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeSidebar}
                      className={`
                        block px-3 py-2 rounded-md transition-colors
                        ${
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout button */}
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-800 rounded-md transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className={isLoginPage ? 'p-4 md:p-8' : 'md:ml-64 p-4 md:p-8'}>{children}</main>
    </div>
  );
}
