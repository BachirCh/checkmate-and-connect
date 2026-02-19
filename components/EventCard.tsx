import { urlFor } from '@/lib/sanity/imageUrl';

type EventCardProps = {
  event: {
    _id: string;
    title: string;
    slug: { current: string };
    image?: any;
    description: string;
    eventType: 'one-time' | 'recurring';
    eventDateTime?: string;
    recurrencePattern?: string;
    author: string;
  };
  showStatus?: boolean; // Show "Ended" badge for past events
};

export default function EventCard({ event, showStatus = false }: EventCardProps) {
  // Sanity CDN image optimization (600x400 crop, auto format for WebP/AVIF)
  const imageUrl = event.image
    ? urlFor(event.image).width(600).height(400).fit('crop').auto('format').url()
    : null;

  // Compute if one-time event is past
  const isPast =
    event.eventType === 'one-time' &&
    event.eventDateTime &&
    new Date(event.eventDateTime) < new Date();

  // Format display time based on event type
  const displayTime =
    event.eventType === 'recurring'
      ? event.recurrencePattern // Show pattern text as-is
      : event.eventDateTime
      ? new Date(event.eventDateTime).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Time TBD';

  return (
    <article className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
      {imageUrl && (
        <img src={imageUrl} alt={event.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        {showStatus && isPast && (
          <span className="inline-block px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded mb-2">
            Ended
          </span>
        )}
        <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
        <p className="text-gray-400 text-sm mb-3">{displayTime}</p>
        <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>
        <p className="text-sm text-gray-500">Organized by {event.author}</p>
      </div>
    </article>
  );
}
