export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-gray-500 py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-white text-lg mb-1">Checkmate & Connect</p>
            <p className="text-sm">&copy; {currentYear} All rights reserved.</p>
          </div>

          <div className="flex gap-6">
            <a
              href="https://www.meetup.com/checkmate-connect-club-casablanca-chapter/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Meetup
            </a>
            <a
              href="https://www.instagram.com/checkmateandconnect"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
