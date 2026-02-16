'use client';

import { useActionState, useState } from 'react';
import { approveMember, rejectMember, deleteMember } from '@/app/actions/members';
import { urlFor } from '@/lib/sanity/imageUrl';
import EditMemberModal from './EditMemberModal';

type Member = {
  _id: string;
  name: string;
  slug: { current: string };
  photo: any;
  jobTitle: string;
  company?: string;
  linkedIn?: string;
  status: string;
  submittedAt: string;
  approvedAt?: string;
};

type MemberRowProps = {
  member: Member;
};

export default function MemberRow({ member }: MemberRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  const [approveState, approveAction, approvePending] = useActionState(
    async () => await approveMember(member._id),
    null
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    async () => await rejectMember(member._id),
    null
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    async () => await deleteMember(member._id),
    null
  );

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
      {/* Photo */}
      <td className="p-4">
        <img
          src={urlFor(member.photo).width(50).height(50).url()}
          alt={member.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      </td>

      {/* Name/Title */}
      <td className="p-4">
        <div className="font-medium">{member.name}</div>
        <div className="text-sm text-gray-400">{member.jobTitle}</div>
      </td>

      {/* Company */}
      <td className="p-4 text-gray-300">{member.company || '—'}</td>

      {/* Submitted */}
      <td className="p-4 text-gray-400 text-sm">
        {new Date(member.submittedAt).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex gap-2">
          {member.status === 'pending' && (
            <>
              <form action={approveAction}>
                <button
                  type="submit"
                  disabled={approvePending}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {approvePending ? 'Approving...' : 'Approve'}
                </button>
              </form>
              <form action={rejectAction}>
                <button
                  type="submit"
                  disabled={rejectPending}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {rejectPending ? 'Rejecting...' : 'Reject'}
                </button>
              </form>
            </>
          )}
          <button
            onClick={() => setEditOpen(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <form action={deleteAction}>
            <button
              type="submit"
              disabled={deletePending}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    <>
      {/* Edit Modal */}
      <EditMemberModal
        member={member}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
