export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-white text-lg mb-1">Checkmate & Connect</p>
            <p className="text-sm">&copy; {currentYear} All rights reserved.</p>
          </div>

          <div className="flex gap-6">
            <a
              href="https://www.meetup.com/checkmate-and-connect"
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
