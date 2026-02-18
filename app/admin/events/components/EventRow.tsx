'use client';

import { useActionState } from 'react';
import { approveEvent, rejectEvent, deleteEvent } from '@/app/actions/events';
import { urlFor } from '@/lib/sanity/imageUrl';

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

type EventRowProps = {
  event: Event;
};

export default function EventRow({ event }: EventRowProps) {
  const [approveState, approveAction, approvePending] = useActionState(
    async () => await approveEvent(event._id),
    null
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    async () => await rejectEvent(event._id),
    null
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    async () => await deleteEvent(event._id),
    null
  );

  // Format time info based on event type
  const timeInfo =
    event.eventType === 'recurring'
      ? event.recurrencePattern || '—'
      : event.eventDateTime
        ? new Date(event.eventDateTime).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : '—';

  // Status badge color
  const statusColor =
    event.status === 'pending'
      ? 'bg-yellow-600'
      : event.status === 'approved'
        ? 'bg-green-600'
        : 'bg-red-600';

  return (
    <tr
      className={`border-b border-gray-800 hover:bg-gray-900 transition-colors ${
        approvePending || rejectPending || deletePending ? 'opacity-50' : ''
      }`}
    >
      {/* Image */}
      <td className="px-4 py-3">
        {event.image ? (
          <img
            src={urlFor(event.image).width(80).height(80).url()}
            alt={event.title}
            className="w-20 h-20 rounded object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center text-gray-500 text-xs">
            No image
          </div>
        )}
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <div className="font-medium">{event.title}</div>
        <div className="text-sm text-gray-400">{event.author}</div>
      </td>

      {/* Event Type */}
      <td className="px-4 py-3">
        <span className="inline-block px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">
          {event.eventType === 'one-time' ? 'One-time' : 'Recurring'}
        </span>
      </td>

      {/* Time */}
      <td className="px-4 py-3 text-gray-300 text-sm">{timeInfo}</td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 text-xs rounded text-white ${statusColor}`}>
          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </span>
      </td>

      {/* Submitted */}
      <td className="px-4 py-3 text-gray-400 text-sm">
        {new Date(event.submittedAt).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {event.status === 'pending' && (
            <>
              <form action={approveAction}>
                <button
                  type="submit"
                  disabled={approvePending}
                  className="h-9 px-4 text-sm bg-green-600 text-white rounded border border-green-500 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {approvePending ? 'Approving...' : 'Approve'}
                </button>
              </form>
              <form action={rejectAction}>
                <button
                  type="submit"
                  disabled={rejectPending}
                  className="h-9 px-4 text-sm bg-red-600 text-white rounded border border-red-500 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {rejectPending ? 'Rejecting...' : 'Reject'}
                </button>
              </form>
            </>
          )}
          <form action={deleteAction}>
            <button
              type="submit"
              disabled={deletePending}
              className="h-9 px-4 text-sm bg-gray-600 text-white rounded border border-gray-500 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deletePending ? 'Deleting...' : 'Delete'}
            </button>
          </form>
        </div>

        {/* Error messages */}
        {approveState?.error && (
          <p className="text-xs text-red-400 mt-1">{approveState.error}</p>
        )}
        {rejectState?.error && (
          <p className="text-xs text-red-400 mt-1">{rejectState.error}</p>
        )}
        {deleteState?.error && (
          <p className="text-xs text-red-400 mt-1">{deleteState.error}</p>
        )}
      </td>
    </tr>
  );
}
