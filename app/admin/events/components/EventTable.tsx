import EventRow from './EventRow';

type Event = {
  _id: string;
  title: string;
  slug: { current: string };
  image?: any;
  description: string;
  eventType: 'one-time' | 'recurring';
  eventDateTime?: string;
  recurrencePattern?: string;
  author: string;
  status: string;
  submittedAt: string;
};

type EventTableProps = {
  events: Event[];
  status: string;
};

export default function EventTable({ events, status }: EventTableProps) {
  if (events.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No events found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-950 border-b border-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Image</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Time</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Submitted</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <EventRow key={event._id} event={event} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
