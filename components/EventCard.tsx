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
  showStatus?: boolean;
  variant?: 'featured' | 'compact';
};

export default function EventCard({ event, showStatus = false, variant = 'featured' }: EventCardProps) {
  const imageUrl = event.image
    ? urlFor(event.image).width(600).height(400).fit('crop').auto('format').url()
    : null;

  const isPast =
    event.eventType === 'one-time' &&
    event.eventDateTime &&
    new Date(event.eventDateTime) < new Date();

  const displayTime =
    event.eventType === 'recurring'
      ? event.recurrencePattern
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

  if (variant === 'compact') {
    return (
      <article className="flex items-center gap-4 bg-[#1a1a1a] rounded-lg border border-[#333333] p-4 hover:border-white/30 transition-colors">
        {imageUrl && (
          <img src={imageUrl} alt={event.title} className="w-20 h-20 rounded-md object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-white truncate">{event.title}</h3>
            {showStatus && isPast && (
              <span className="shrink-0 px-2 py-0.5 text-xs bg-[#333333] text-[#9ca3af] rounded">
                Ended
              </span>
            )}
          </div>
          <p className="text-sm text-[#9ca3af] mb-1">{displayTime}</p>
          <p className="text-sm text-gray-400 truncate">{event.description}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#333333] hover:border-white/30 transition-colors">
      {imageUrl && (
        <img src={imageUrl} alt={event.title} className="w-full h-56 object-cover" />
      )}
      <div className="p-6">
        {showStatus && isPast && (
          <span className="inline-block px-2 py-1 text-xs bg-[#333333] text-[#9ca3af] rounded mb-2">
            Ended
          </span>
        )}
        <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
        <p className="text-[#9ca3af] text-sm mb-3">{displayTime}</p>
        <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>
        <p className="text-sm text-gray-500">Organized by {event.author}</p>
      </div>
    </article>
  );
}
