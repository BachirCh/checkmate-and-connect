import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-gray-500 py-12 border-t border-[#333333]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="font-semibold text-white text-lg mb-2 font-heading">Checkmate & Connect</p>
            <p className="text-sm text-[#9ca3af]">
              Chess & Entrepreneurship Community in Casablanca
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-medium text-white text-sm mb-3">Navigate</p>
            <div className="flex flex-col gap-2">
              <Link href="/events" className="text-sm hover:text-white transition-colors">Events</Link>
              <Link href="/members" className="text-sm hover:text-white transition-colors">Members</Link>
              <Link href="/blog" className="text-sm hover:text-white transition-colors">Blog</Link>
              <Link href="/join" className="text-sm hover:text-white transition-colors">Join Us</Link>
            </div>
          </div>

          {/* Social & Legal */}
          <div>
            <p className="font-medium text-white text-sm mb-3">Connect</p>
            <div className="flex flex-col gap-2">
              <a
                href="https://www.meetup.com/checkmate-connect-club-casablanca-chapter/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-white transition-colors"
              >
                Meetup
              </a>
              <a
                href="https://www.instagram.com/checkmateandconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-white transition-colors"
              >
                Instagram
              </a>
              <Link href="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#333333] pt-6 text-center">
          <p className="text-sm text-[#9ca3af]">&copy; {currentYear} Checkmate & Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
