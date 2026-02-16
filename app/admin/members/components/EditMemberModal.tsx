'use client';

import { useActionState, useState, useEffect } from 'react';
import { editMember } from '@/app/actions/members';

type EditMemberModalProps = {
  member: {
    _id: string;
    name: string;
    jobTitle: string;
    company?: string;
    linkedIn?: string;
  };
  open: boolean;
  onClose: () => void;
};

export default function EditMemberModal({ member, open, onClose }: EditMemberModalProps) {
  // Local state for form fields
  const [name, setName] = useState(member.name);
  const [jobTitle, setJobTitle] = useState(member.jobTitle);
  const [company, setCompany] = useState(member.company || '');
  const [linkedIn, setLinkedIn] = useState(member.linkedIn || '');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName(member.name);
      setJobTitle(member.jobTitle);
      setCompany(member.company || '');
      setLinkedIn(member.linkedIn || '');
    }
  }, [open, member]);

  // Wire editMember Server Action with useActionState
  const [editState, editAction, editPending] = useActionState(
    async () => await editMember(member._id, {
      name,
      jobTitle,
      company: company || undefined,
      linkedIn: linkedIn || undefined,
    }),
    null
  );

  // Close modal on successful submission
  useEffect(() => {
    if (editState?.success) {
      onClose();
    }
  }, [editState, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative bg-black border border-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-medium mb-4">Edit Member</h2>

        <form action={editAction} className="space-y-4">
          {/* Name field (required) */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-black border border-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Title field (required) */}
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium mb-1">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-black border border-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Company field (optional) */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* LinkedIn field (optional) */}
          <div>
            <label htmlFor="linkedIn" className="block text-sm font-medium mb-1">
              LinkedIn
            </label>
            <input
              type="text"
              id="linkedIn"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 bg-black border border-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error message */}
          {editState?.error && (
            <p className="text-sm text-red-400">{editState.error}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={editPending}
              className="px-4 py-2 text-sm border border-gray-800 rounded hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editPending || !name.trim() || !jobTitle.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
