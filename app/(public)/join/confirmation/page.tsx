import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Application Submitted | Checkmate & Connect',
};

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl font-bold text-center mb-4">
          Application Submitted!
        </h1>

        {/* Confirmation Text */}
        <p className="text-gray-300 text-center text-lg mb-12">
          Thank you for applying to join the Checkmate & Connect member directory.
        </p>

        {/* What Happens Next Section */}
        <div className="border border-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What happens next?</h2>

          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white font-semibold">
                1
              </span>
              <span className="text-gray-300 pt-1">
                Our team will review your submission
              </span>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white font-semibold">
                2
              </span>
              <span className="text-gray-300 pt-1">
                Once approved, your profile will appear in the member directory
              </span>
            </li>

            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white font-semibold">
                3
              </span>
              <span className="text-gray-300 pt-1">
                Connect with other members at our weekly Wednesday meetups
              </span>
            </li>
          </ol>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
