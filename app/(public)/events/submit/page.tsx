import { Metadata } from 'next';
import EventSubmissionForm from '@/components/forms/EventSubmissionForm';

export const metadata: Metadata = {
  title: 'Submit an Event | Checkmate & Connect',
  description: 'Propose an event for the Checkmate & Connect community. Share chess tournaments, workshops, or entrepreneurship gatherings.',
};

export default function EventSubmitPage() {
  return (
      <main className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Submit an Event
            </h1>
            <p className="text-lg text-gray-400">
              Propose an event for the Checkmate & Connect community.
              Our team will review and publish approved events.
            </p>
          </div>

          <EventSubmissionForm />
        </div>
      </main>
  );
}
